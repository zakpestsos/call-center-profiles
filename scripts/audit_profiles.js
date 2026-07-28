// Live-profile audit for the region-pricing viewer.
//
// For every profile in the master sheet:
//   1. Fetch its payload from the production Apps Script API (read-only).
//   2. Data checks: tier shapes, region tags vs ZIP-list territories, empty
//      price fields, __unlisted__ blocks, contiguity of region blocks.
//   3. Render checks: run the payload through the REAL viewer code (jsdom)
//      under every region scenario (no region, each real region, Area Not
//      Listed) and flag exceptions, NaN/undefined output, or missing pricing.
//
// Usage:  node audit_profiles.js            (audits every profile)
//         node audit_profiles.js <id> [...] (audits specific profileIds)
// Needs jsdom. Run from the folder containing index.html.
const VIEWER_PATH = './index.html';
const WEB_APP_URL = 'https://script.google.com/a/macros/pest-sos.com/s/AKfycbxKIxVIVD2UdwthrtwBDic5al9uEcB1-DAceQdq2lC8ME5znUJavcfzLjb6AnI9WNEGlQ/exec';
const MASTER_SHEET_ID = '1WId_kg8Fu0dbnpWSSQQVv-GJJibaeSu7p23PEaeePec';

const fs = require('fs');
const { JSDOM } = require('jsdom');

// ── viewer code harness (same extraction approach as test_viewer_regions.js) ──
function extract(src, names) {
  let out = '';
  for (const name of names) {
    const start = src.indexOf(`function ${name}(`);
    if (start === -1) throw new Error(`not found: ${name}`);
    let i = src.indexOf('{', start), depth = 0, end = -1;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    out += src.slice(start, end) + '\n\n';
  }
  return out;
}
function extractRegionBlock(src) {
  const start = src.indexOf('// ─── Region-Based Pricing');
  const end   = src.indexOf('// ─── Profile Load');
  if (start === -1 || end === -1) throw new Error('region section markers not found');
  return src.slice(start, end);
}

const dom = new JSDOM(`<!DOCTYPE html><body>
  <input id="zipInput"><div id="zipResult"></div>
  <div id="regionPickerWrap" style="display:none;"><select id="regionPicker"></select><div id="regionStatus"></div></div>
  <div id="mount"></div>
</body>`);
global.document = dom.window.document;
global.window   = dom.window;

// Viewer auto-calc goes through a controllable queue — but the stub is only
// installed while rendering; fetch (undici) needs the real setTimeout.
const realSetTimeout = global.setTimeout;
let _timerQueue = [];
const stubTimer = (fn) => { _timerQueue.push(fn); return 0; };
const flushTimers = () => { const q = _timerQueue; _timerQueue = []; q.forEach(fn => fn()); };

global.populateServices = () => {};
global._getAddonMap = () => new Map();
global.renderAddonSection = () => {};
global.openAvailableTechsModal = () => {};
global.activateSubTab = () => {};
global.changeServiceQty = () => {};
global.toast = () => {};
global.clientData = {};

const viewerSrc = fs.readFileSync(VIEWER_PATH, 'utf8');
eval(extractRegionBlock(viewerSrc) +
     extract(viewerSrc, ['escapeHtml', 'pricingInputHTML', 'pricingUnitLabel',
       'calculatePricing', 'calculateSubServicePricing',
       'buildServicePanel', 'buildSubServiceHTML', 'detailItem', 'subDetailItem']) +
     '\nglobalThis.__setRegion = (v) => { _activeRegion = v; _activeRegionSource = v ? "manual" : null; };');

const mount = document.getElementById('mount');
const norm = (x) => String(x == null ? '' : x).trim().toLowerCase();

// ── data checks ──────────────────────────────────────────────────────────────
function priceFieldsOk(t) {
  const mode = t.pricingMode || 'sqft';
  if (mode === 'flat')     return !!String(t.flatPrice    || '').trim();
  if (mode === 'per_unit') return !!String(t.pricePerUnit || '').trim();
  return !!String(t.firstPrice || '').trim();
}

function checkData(payload, findings) {
  const territories = new Set((payload.serviceAreas || [])
    .map(a => norm(a.territory)).filter(Boolean));
  const zipsNoTerritory = (payload.serviceAreas || [])
    .filter(a => !norm(a.territory)).length;

  const allUnits = [];
  (payload.services || []).forEach(svc => {
    allUnits.push({ label: `service "${svc.name}"`, unit: svc });
    (svc.subServices || []).forEach(sub =>
      allUnits.push({ label: `service "${svc.name}" / sub "${sub.name}"`, unit: sub }));
  });

  let anyRegioned = false, anyUnlisted = false;
  allUnits.forEach(({ label, unit }) => {
    const tiers = unit.pricingTiers;
    if (tiers == null) return;
    if (!Array.isArray(tiers)) { findings.errors.push(`${label}: pricingTiers is not an array`); return; }
    const regionKeys = tiers.map(t => norm(t.region)).filter(Boolean);
    if (!regionKeys.length) return;
    anyRegioned = true;

    // contiguity: same-region tiers must be adjacent (base-tier-first blocks)
    const seq = [];
    tiers.forEach(t => { const k = norm(t.region); if (!seq.length || seq[seq.length - 1] !== k) seq.push(k); });
    const dupBlocks = seq.filter((k, i) => seq.indexOf(k) !== i);
    if (dupBlocks.length) findings.errors.push(`${label}: region blocks not contiguous (${[...new Set(dupBlocks)].join(', ')})`);

    tiers.forEach((t, i) => {
      const k = norm(t.region);
      if (k === '__unlisted__') anyUnlisted = true;
      else if (k && !territories.has(k))
        findings.warnings.push(`${label}: tier ${i} region "${t.region}" matches no ZIP-list territory (orphan — reachable only via flagged picker entry)`);
      if (!priceFieldsOk(t))
        findings.errors.push(`${label}: tier ${i} (${t.pricingMode || 'sqft'}${k ? ', region ' + t.region : ''}) has empty price fields`);
    });
  });

  if (anyRegioned && zipsNoTerritory > 0 && !anyUnlisted)
    findings.warnings.push(`${zipsNoTerritory} served ZIP(s) have no territory and no service configures Area Not Listed pricing — agents will hit the region-not-set state there`);
  if (!anyRegioned && territories.size > 0)
    findings.notes.push(`ZIP list defines territories (${territories.size}) but no service prices by region — renders exactly as before`);
  return { anyRegioned };
}

// ── render checks ────────────────────────────────────────────────────────────
function renderScenario(payload, regionValue, findings, label) {
  global.clientData = payload;
  __setRegion(regionValue);
  try { applyRegionFilter(); } catch (e) { findings.errors.push(`[${label}] applyRegionFilter threw: ${e.message}`); return; }

  (payload.services || []).forEach((svc, idx) => {
    mount.innerHTML = '';
    _timerQueue = [];
    let panel;
    try { panel = buildServicePanel(svc, idx); } catch (e) {
      findings.errors.push(`[${label}] "${svc.name}" build threw: ${e.message}`); return;
    }
    mount.appendChild(panel);
    try { flushTimers(); } catch (e) {
      findings.errors.push(`[${label}] "${svc.name}" auto-calc threw: ${e.message}`); return;
    }

    // exercise the sqft/acreage calculators with an in-range value
    const runCalc = (id, tiers, fn, subIdx) => {
      const mode = tiers?.[0]?.pricingMode || 'sqft';
      if (!Array.isArray(tiers) || !tiers.length || (mode !== 'sqft' && mode !== 'acreage')) return;
      const inp = document.getElementById(`sqft_${id}`);
      if (!inp) return;
      inp.value = String((Number(tiers[0].sqftMin) || 0) + 1);
      try { subIdx == null ? fn(id) : fn(id, subIdx); } catch (e) {
        findings.errors.push(`[${label}] "${svc.name}" calculate threw: ${e.message}`);
      }
    };
    runCalc(`service_${idx}`, svc.pricingTiers, calculatePricing);
    (svc.subServices || []).forEach((sub, i) =>
      runCalc(`service_${idx}_sub_${i}`, sub.pricingTiers, calculateSubServicePricing, i));

    const html = mount.innerHTML;
    if (/\$NaN|>NaN<|>undefined<|\$undefined/.test(html))
      findings.errors.push(`[${label}] "${svc.name}" rendered NaN/undefined in output`);

    // every service must show a price, an input, or an explicit state
    const hasSomething = /price-display-value|sqft-input|region-state-note|No pricing tiers available/.test(html);
    if (!hasSomething)
      findings.warnings.push(`[${label}] "${svc.name}" rendered no price, input, or explicit state`);
  });
}

// ── fetch helpers ────────────────────────────────────────────────────────────
async function fetchJson(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function listProfileIds() {
  const url = `https://docs.google.com/spreadsheets/d/${MASTER_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Client_Profiles&headers=1`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`sheet CSV HTTP ${res.status}`);
  const text = await res.text();
  // Profile_ID is the first column; parse quoted CSV cells across multiline rows
  const ids = [...text.matchAll(/^"((?:profile|test)[^"]*)"/gm)].map(m => m[1]);
  return [...new Set(ids)];
}

// ── main ─────────────────────────────────────────────────────────────────────
(async () => {
  let ids = process.argv.slice(2);
  if (!ids.length) {
    ids = await listProfileIds();
    console.log(`Found ${ids.length} profile(s) in the master sheet.\n`);
  }
  let totalErrors = 0, totalWarnings = 0;

  for (const id of ids) {
    const findings = { errors: [], warnings: [], notes: [] };
    let payload;
    try {
      payload = await fetchJson(`${WEB_APP_URL}?profileId=${encodeURIComponent(id)}`);
      if (payload && payload.error) throw new Error(payload.error);
    } catch (e) {
      console.log(`✗ ${id}: FETCH FAILED — ${e.message}\n`);
      totalErrors++;
      continue;
    }

    const { anyRegioned } = checkData(payload, findings);

    // Render scenarios. Deep-copy so scenarios and profiles can't cross-contaminate.
    const scenarios = [[null, 'no region']];
    if (anyRegioned) {
      const regions = new Set();
      (payload.services || []).forEach(svc => {
        [svc, ...(svc.subServices || [])].forEach(u => (u.pricingTiers || []).forEach(t => {
          const k = norm(t.region);
          if (k && k !== '__unlisted__') regions.add(String(t.region).trim());
        }));
      });
      (payload.serviceAreas || []).forEach(a => { if (norm(a.territory)) regions.add(String(a.territory).trim()); });
      regions.forEach(r => scenarios.push([r, `region ${r}`]));
      scenarios.push(['__unlisted__', 'Area Not Listed']);
    }
    global.setTimeout = stubTimer;
    try {
      scenarios.forEach(([region, label]) =>
        renderScenario(JSON.parse(JSON.stringify(payload)), region, findings, label));
    } finally {
      global.setTimeout = realSetTimeout;
    }

    const status = findings.errors.length ? '✗' : findings.warnings.length ? '⚠' : '✓';
    console.log(`${status} ${id}  (${payload.companyName || '?'})` +
      (anyRegioned ? '  [REGION PRICING]' : ''));
    findings.errors.forEach(m => console.log(`    ERROR: ${m}`));
    findings.warnings.forEach(m => console.log(`    warn:  ${m}`));
    findings.notes.forEach(m => console.log(`    note:  ${m}`));
    totalErrors += findings.errors.length;
    totalWarnings += findings.warnings.length;
  }

  console.log(`\n${totalErrors} error(s), ${totalWarnings} warning(s) across ${ids.length} profile(s).`);
  process.exit(totalErrors ? 1 : 0);
})();
