// Viewer (index.html) region-based pricing suite.
//
// Two files are read:
//   VIEWER_PATH — the updated index.html (the file under test)
//   BASE_PATH   — the pre-change index.html, used ONLY for the equivalence
//                 section: a payload with no regions must render service
//                 panels byte-identical to the old code. If BASE_PATH is
//                 missing, the equivalence section is skipped with a warning.
//
// Needs jsdom. Adjust the paths below to where the files live.
const VIEWER_PATH = './index.html';
const BASE_PATH   = './index_base.html';

const fs = require('fs');
const { JSDOM } = require('jsdom');

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

// The region state lives in `let` declarations inside a marked section, so the
// whole section is evaluated (not just the functions) and closures keep access.
function extractRegionBlock(src) {
  const start = src.indexOf('// ─── Region-Based Pricing');
  const end   = src.indexOf('// ─── Profile Load');
  if (start === -1 || end === -1) throw new Error('region section markers not found');
  return src.slice(start, end);
}

const RENDER_FNS = [
  'escapeHtml', 'pricingInputHTML', 'pricingUnitLabel',
  'calculatePricing', 'calculateSubServicePricing',
  'buildServicePanel', 'buildSubServiceHTML', 'detailItem', 'subDetailItem',
  'checkZip'
];

// ── DOM + globals shared by both evals ──────────────────────────────────────
const dom = new JSDOM(`<!DOCTYPE html><body>
  <input id="zipInput"><div id="zipResult"></div>
  <div id="regionPickerWrap" style="display:none;">
    <select id="regionPicker"></select>
    <div id="regionStatus"></div>
  </div>
  <div id="mount"></div>
</body>`);
global.document = dom.window.document;
global.window   = dom.window;

// Deterministic timers: build-time auto-calc goes through this queue so tests
// decide when (and whether) it runs.
let _timerQueue = [];
global.setTimeout = (fn) => { _timerQueue.push(fn); return 0; };
const flushTimers = () => { const q = _timerQueue; _timerQueue = []; q.forEach(fn => fn()); };

// Stubs for collaborators outside the pricing path
let populateServicesCalls = 0;
global.populateServices = () => { populateServicesCalls++; };
global._getAddonMap = () => new Map();
global.renderAddonSection = () => {};
global.openAvailableTechsModal = () => {};
global.activateSubTab = () => {};
global.changeServiceQty = () => {};
global.toast = () => {};
global.clientData = {};

let fails = 0;
const check = (c, m) => { console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const mount = document.getElementById('mount');

// ── Fixture payloads ────────────────────────────────────────────────────────
// Regionless services covering every pricing mode the panel builder branches on.
const regionlessServices = () => ([
  { name: 'Plain Sqft', serviceIdentifier: 'GPC', frequency: 'Monthly', serviceType: 'Monthly GPC',
    pests: 'Ants', pricingTiers: [
      { sqftMin: 0, sqftMax: 2500, firstPrice: '$99.00', recurringPrice: '$49.00' },
      { sqftMin: 2501, sqftMax: 999999, firstPrice: '$120.00', recurringPrice: '$60.00' }] },
  { name: 'Plain Flat', serviceIdentifier: 'Specialty', frequency: 'One Time', serviceType: 'One Time',
    pests: 'Bed Bugs', pricingTiers: [{ pricingMode: 'flat', flatPrice: '$75.00' }] },
  { name: 'Plain Per Unit', serviceIdentifier: 'Specialty', frequency: 'One Time', serviceType: 'One Time',
    pests: 'Wasps', pricingTiers: [{ pricingMode: 'per_unit', pricePerUnit: '$40.00', unitLabel: 'nest' }] },
  { name: 'Plain Inspection', serviceIdentifier: 'Termite', frequency: 'One Time', serviceType: 'Free Inspection',
    pests: 'Termites', pricingTiers: [] },
  { name: 'Multi Freq', serviceIdentifier: 'GPC', frequency: 'Multiple', serviceType: 'GPC',
    pests: 'Ants', subServices: [
      { name: 'Monthly', frequency: 'Monthly', pests: 'Ants', pricingTiers: [
        { sqftMin: 0, sqftMax: 2500, firstPrice: '$110.00', recurringPrice: '$55.00' }] },
      { name: 'Quarterly', frequency: 'Quarterly', pests: 'Ants', pricingTiers: [
        { pricingMode: 'flat', flatPrice: '$130.00' }] }] }
]);

const regionedService = () => ({
  name: 'Regioned Service', serviceIdentifier: 'Specialty', frequency: 'One Time', serviceType: 'One Time',
  pests: 'Roaches', pricingTiers: [
    { pricingMode: 'sqft', region: 'north', firstPrice: '$225.00', recurringPrice: 'N/A', sqftMin: 0, sqftMax: 2500 },
    { pricingMode: 'sqft', region: 'north', firstPrice: '$285.00', recurringPrice: 'N/A', sqftMin: 2501, sqftMax: 999999 },
    { pricingMode: 'flat', region: 'South', flatPrice: '$250.00' }
  ]
});

const regionedProfile = () => ({
  services: [regionedService(), ...regionlessServices()],
  addOns: [],
  serviceAreas: [
    { zip: '75001', city: 'Dallas', state: 'TX', branch: 'North Branch', territory: 'North', inService: true },
    { zip: '75201', city: 'Dallas', state: 'TX', branch: 'Central Branch', territory: 'South', inService: true },
    { zip: '75301', city: 'Carrollton', state: 'TX', branch: 'North Branch', territory: '', inService: true }
  ]
});

const renderPanels = (services) => {
  mount.innerHTML = '';
  _timerQueue = [];
  const html = [];
  services.forEach((svc, i) => {
    const panel = buildServicePanel(svc, i);
    mount.appendChild(panel);
    html.push(panel.outerHTML);
  });
  return html;
};

const viewerSrc = fs.readFileSync(VIEWER_PATH, 'utf8');

// ════════════════════════════════════════════════════════════════════════════
console.log('EQUIVALENCE: no-regions payload renders byte-identical to the old code');
let baseHTML = null;
if (fs.existsSync(BASE_PATH)) {
  const baseSrc = fs.readFileSync(BASE_PATH, 'utf8');
  eval(extract(baseSrc, RENDER_FNS));
  global.clientData = { services: regionlessServices(), addOns: [], serviceAreas: [] };
  baseHTML = renderPanels(clientData.services);
  mount.innerHTML = '';
  _timerQueue = [];
} else {
  console.log('  WARN  base file not found — equivalence section skipped');
}

// Load the updated viewer (overwrites the base functions) + its region section.
eval(extractRegionBlock(viewerSrc) +
     extract(viewerSrc, RENDER_FNS) +
     '\nglobalThis.__region = { get: () => _activeRegion, source: () => _activeRegionSource };');

global.clientData = { services: regionlessServices(), addOns: [], serviceAreas: [] };
applyRegionFilter();
if (baseHTML) {
  const updatedHTML = renderPanels(clientData.services);
  baseHTML.forEach((h, i) => check(h === updatedHTML[i],
    `service "${clientData.services[i].name}" renders identical to base`));
  flushTimers(); // auto-calc must still run clean on regionless flat/per-unit panels
  check(true, 'auto-calc timers flushed without throwing');
}
const untouched = regionlessServices();
global.clientData = { services: untouched, addOns: [], serviceAreas: [] };
const originalRefs = untouched.map(s => s.pricingTiers);
applyRegionFilter();
check(untouched.every((s, i) => s.pricingTiers === originalRefs[i]),
  'regionless services keep their original pricingTiers array (not even replaced)');
check(untouched.every(s => s._allPricingTiers === undefined),
  'regionless services get no _allPricingTiers annotation');
renderRegionPicker();
check(document.getElementById('regionPickerWrap').style.display === 'none',
  'region picker stays hidden for regionless profiles');

// ════════════════════════════════════════════════════════════════════════════
console.log('\nFILTERING: central filter, backup, idempotence');
global.clientData = regionedProfile();
applyRegionFilter(); // no active region yet
const rs = clientData.services[0];
check(rs._allPricingTiers.length === 3, 'raw tiers backed up before filtering');
check(rs.pricingTiers.length === 0, 'no active region -> only untagged tiers remain (none here)');
__region; // (accessor exists)
setActiveRegion('North', 'manual');
check(rs.pricingTiers.length === 2, 'North active -> both North tiers pass');
check(rs.pricingTiers[0].firstPrice === '$225.00', 'North base tier is index 0');
check(rs.pricingTiers[0].pricingMode === 'sqft', 'index 0 drives the UI mode: sqft for North');
setActiveRegion('South', 'manual');
check(rs.pricingTiers.length === 1 && rs.pricingTiers[0].pricingMode === 'flat',
  'South active -> flat tier at index 0 (mixed modes across regions)');
setActiveRegion('North', 'manual');
check(rs.pricingTiers.length === 2 && rs.pricingTiers[0].firstPrice === '$225.00',
  'switching back re-derives from backup — nothing was destroyed');
check(rs._allPricingTiers.length === 3, 'backup still holds all three tiers');
check(filterTiersForRegion([{ firstPrice: '$1' }, { region: 'x', firstPrice: '$2' }], null).length === 1,
  'untagged tiers always pass the filter');

console.log('\nCASE DRIFT: ZIP-list casing vs tier casing');
setActiveRegion(null);
document.getElementById('zipInput').value = '75001';
populateServicesCalls = 0;
checkZip(); // territory "North" (ZIP list casing); tiers say "north"
check(__region.get() === 'North', 'region resolved from ZIP with ZIP-list casing');
check(__region.source() === 'zip', 'source recorded as zip');
check(rs.pricingTiers.length === 2, 'lower-cased tier regions still match — no blanked prices');
check(populateServicesCalls > 0, 'services re-rendered after region change');
check(document.getElementById('zipResult').textContent.includes('Region: North'),
  'ZIP result shows the resolved region');

console.log('\nZIP WITHOUT TERRITORY: explicit state, no fallback');
document.getElementById('zipInput').value = '75301';
checkZip();
check(__region.get() === null, 'previous region cleared — no stale region prices the new caller');
check(document.getElementById('zipResult').textContent.includes('region not set'),
  'explicit "region not set" message shown');
check(document.getElementById('regionStatus').textContent.includes('No region selected'),
  'sidebar status shows unselected state');

console.log('\nZIP NOT IN LIST: untouched behavior');
setActiveRegion('South', 'manual');
document.getElementById('zipInput').value = '99999';
checkZip();
check(document.getElementById('zipResult').textContent.includes('Not in service area'),
  'out-of-area message unchanged');
check(__region.get() === 'South', 'active region untouched by an out-of-area ZIP');

console.log('\nPICKER: derived from ZIP list, orphans flagged, manual select');
clientData.services[0]._allPricingTiers.push({ pricingMode: 'flat', region: 'Ghost', flatPrice: '$9' });
renderRegionPicker();
const opts = [...document.getElementById('regionPicker').options].map(o => o.textContent);
check(document.getElementById('regionPickerWrap').style.display === '', 'picker visible for regioned profile');
check(opts.some(t => t === 'North') && opts.some(t => t === 'South'),
  'ZIP-list territories listed with their casing');
check(opts.some(t => t.includes('Ghost') && t.includes('not on ZIP list')),
  'orphan tier region reachable via flagged picker entry');
onRegionPickerChange('Ghost');
check(__region.get() === 'Ghost' && __region.source() === 'manual', 'manual pick sets region');
check(rs.pricingTiers.length === 1 && rs.pricingTiers[0].flatPrice === '$9',
  'orphan region pricing is reachable, not deleted');
clientData.services[0]._allPricingTiers.pop();

console.log('\nCARD STATES: blocked, badged, empty-region');
setActiveRegion(null);
let html = renderPanels([clientData.services[0]]);
check(html[0].includes('Prices vary by region'), 'no region -> explicit select-region state');
check(!html[0].includes(`id="pricing_service_0"`), 'blocked card renders no price element');
check(_timerQueue.length === 0, 'no auto-calc scheduled for a blocked card');
flushTimers();

console.log('\nINLINE ZIP ON BLOCKED CARDS: resolve region without leaving the card');
check(html[0].includes(`id="regionZip_service_0"`), 'blocked card offers its own ZIP input');
document.getElementById('regionZip_service_0').value = 'abc';
resolveRegionFromCardZip('regionZip_service_0', 'regionZipNotice_service_0');
check(document.getElementById('regionZipNotice_service_0').textContent.includes('valid 5-digit'),
  'invalid ZIP -> inline notice');
document.getElementById('regionZip_service_0').value = '99999';
resolveRegionFromCardZip('regionZip_service_0', 'regionZipNotice_service_0');
check(document.getElementById('regionZipNotice_service_0').textContent.includes('Not in service area'),
  'out-of-area ZIP -> inline notice');
check(__region.get() === null, 'region still unset after failed resolutions');
document.getElementById('regionZip_service_0').value = '75301';
resolveRegionFromCardZip('regionZip_service_0', 'regionZipNotice_service_0');
check(document.getElementById('regionZipNotice_service_0').textContent.includes('region not set'),
  'no-territory ZIP -> explicit inline notice');
check(__region.get() === null, 'region still unset — never falls back to a default region');
populateServicesCalls = 0;
document.getElementById('regionZip_service_0').value = '75001';
resolveRegionFromCardZip('regionZip_service_0', 'regionZipNotice_service_0');
check(__region.get() === 'North' && __region.source() === 'zip',
  'valid ZIP typed on the card resolves the region');
check(populateServicesCalls > 0, 'cards re-render after inline resolution');
check(document.getElementById('zipInput').value === '75001', 'sidebar ZIP tool mirrored');
check(document.getElementById('zipResult').textContent.includes('Region: North'),
  'sidebar result mirrored');
html = renderPanels([clientData.services[0]]);
check(!html[0].includes('regionZip_service_0'),
  'once a region is set the inline ZIP input is gone');

setActiveRegion('North', 'manual');
html = renderPanels([clientData.services[0]]);
check(html[0].includes('region-badge'), 'active region -> badge rendered on the card');
check(html[0].includes('>North</span>'), 'badge shows the region name');
calculatePricing('service_0'); // needs input value for sqft
document.getElementById('sqft_service_0').value = '2000';
calculatePricing('service_0');
check(document.getElementById('pricing_service_0').innerHTML.includes('$225.00'),
  'North @2000 sqft quotes the North tier');
document.getElementById('sqft_service_0').value = '3000';
calculatePricing('service_0');
check(document.getElementById('pricing_service_0').innerHTML.includes('$285.00'),
  'North @3000 sqft quotes the second North tier');

setActiveRegion('South', 'manual');
html = renderPanels([clientData.services[0]]);
check(html[0].includes('>South</span>'), 'badge follows the region switch');
flushTimers(); // South is flat -> auto-calc fires
check(document.getElementById('pricing_service_0').innerHTML.includes('$250.00'),
  'South auto-shows the flat $250.00 price');

// A region-affected service with zero tiers in the active region
const orphanSvc = { name: 'Orphan Svc', serviceType: 'One Time', frequency: 'One Time', pests: 'X',
  pricingTiers: [{ pricingMode: 'flat', region: 'Elsewhere', flatPrice: '$1.00' }] };
clientData.services.push(orphanSvc);
applyRegionFilter();
html = renderPanels([orphanSvc]);
check(html[0].includes('No pricing configured for the South region'),
  'zero matching tiers -> explicit no-pricing state, not an empty or wrong display');
check(_timerQueue.length === 0, 'no auto-calc scheduled for the empty-region card');
clientData.services.pop();

console.log('\nSUB-SERVICES: filtered, badged, blocked independently');
const multiSvc = { name: 'Multi Regioned', serviceIdentifier: 'GPC', frequency: 'Multiple', serviceType: 'GPC',
  pests: 'Ants', subServices: [
    { name: 'Regioned Sub', frequency: 'Monthly', pests: 'Ants', pricingTiers: [
      { pricingMode: 'sqft', region: 'North', firstPrice: '$60.00', recurringPrice: '$30.00', sqftMin: 0, sqftMax: 999999 },
      { pricingMode: 'flat', region: 'South', flatPrice: '$65.00' }] },
    { name: 'Plain Sub', frequency: 'Quarterly', pests: 'Ants', pricingTiers: [
      { sqftMin: 0, sqftMax: 999999, firstPrice: '$77.00', recurringPrice: '$44.00' }] }] };
clientData.services.push(multiSvc);
setActiveRegion(null);
html = renderPanels([multiSvc]);
check(html[0].includes('Prices vary by region'), 'regioned sub shows select-region state');
check(html[0].includes('$77.00') === false, 'prices are not inlined in sqft subs (input-driven)');
check((html[0].match(/Prices vary by region/g) || []).length === 1,
  'regionless sub in the same service is NOT blocked');
setActiveRegion('South', 'manual');
html = renderPanels([multiSvc]);
const sub = multiSvc.subServices[0];
check(sub.pricingTiers.length === 1 && sub.pricingTiers[0].flatPrice === '$65.00',
  'sub tiers filtered to South');
check(html[0].includes('region-badge'), 'regioned sub carries the badge');
calculateSubServicePricing('service_0_sub_0', 0);
check(document.getElementById('pricing_service_0_sub_0').innerHTML.includes('$65.00'),
  'sub-service quotes the South flat price');
clientData.services.pop();

console.log('\nAREA NOT LISTED (__unlisted__) FALLBACK:');
// The strict filter must exclude the fallback whenever a real region is active
check(filterTiersForRegion(
        [{ region: '__unlisted__', flatPrice: '$9' }, { region: 'North', flatPrice: '$5' }], 'North'
      ).length === 1,
  '__unlisted__ tiers excluded when a real region is active');
check(filterTiersForRegion(
        [{ region: '__unlisted__', flatPrice: '$9' }, { region: 'North', flatPrice: '$5' }, { flatPrice: '$1' }], '__unlisted__'
      ).map(t => t.flatPrice).join(',') === '$9,$1',
  'fallback mode keeps __unlisted__ + untagged tiers only');

// With NO fallback configured anywhere, an unassigned ZIP keeps the old behavior
setActiveRegion('South', 'manual');
document.getElementById('zipInput').value = '75301';
checkZip();
check(__region.get() === null, 'no fallback configured -> unassigned ZIP clears region (old behavior)');
check(document.getElementById('zipResult').textContent.includes('region not set'),
  'old "region not set" message kept when no fallback exists');

// Configure a fallback on one service; the other regioned service has none
const fbSvc = { name: 'Fallback Svc', serviceType: 'One Time', frequency: 'One Time', pests: 'X',
  pricingTiers: [
    { pricingMode: 'flat', region: '__unlisted__', flatPrice: '$199.00' },
    { pricingMode: 'sqft', region: 'North', firstPrice: '$210.00', recurringPrice: 'N/A', sqftMin: 0, sqftMax: 999999 }
  ] };
clientData.services.push(fbSvc);
applyRegionFilter();
checkZip(); // 75301 again, now with a fallback configured
check(__region.get() === '__unlisted__', 'unassigned ZIP activates the fallback mode');
check(document.getElementById('zipResult').textContent.includes('Area Not Listed pricing applies'),
  'ZIP result explains fallback pricing is in effect');
check(fbSvc.pricingTiers.length === 1 && fbSvc.pricingTiers[0].flatPrice === '$199.00',
  'fallback service filtered to its __unlisted__ block');

html = renderPanels([fbSvc]);
check(html[0].includes('Area Not Listed'), 'fallback pricing labeled "Area Not Listed" on the card');
check(html[0].includes('region-badge-unlisted'), 'fallback badge visually distinct from a real region');
flushTimers(); // flat fallback auto-shows
check(document.getElementById('pricing_service_0').innerHTML.includes('$199.00'),
  'fallback flat price quoted from the __unlisted__ block');

const noFbSvc = clientData.services[0]; // Regioned Service — no fallback block
html = renderPanels([noFbSvc]);
check(html[0].includes('no Area Not Listed pricing'),
  'service without a fallback block keeps the region-not-set state');
check(!html[0].includes('No pricing configured'),
  'unassigned ZIP does not misreport as an empty region');

renderRegionPicker();
const fbOpts = [...document.getElementById('regionPicker').options].map(o => o.textContent);
check(!fbOpts.some(t => /unlisted|Area Not Listed/i.test(t)),
  '__unlisted__ never offered in the manual region picker');

// Footprint unchanged: a ZIP outside the list is still "not in service"
document.getElementById('zipInput').value = '99999';
checkZip();
check(document.getElementById('zipResult').textContent.includes('Not in service area'),
  'fallback does not extend the service footprint');

// A real region resolved later excludes the fallback again
setActiveRegion('North', 'manual');
check(fbSvc.pricingTiers.length === 1 && fbSvc.pricingTiers[0].firstPrice === '$210.00',
  'real region active -> __unlisted__ excluded, North tier at index 0');
html = renderPanels([fbSvc]);
check(!html[0].includes('Area Not Listed') && html[0].includes('>North</span>'),
  'badge returns to the real region name');
clientData.services.pop();

console.log(fails === 0 ? '\nALL PASSED' : `\n${fails} FAILED`);
process.exit(fails === 0 ? 0 : 1);
