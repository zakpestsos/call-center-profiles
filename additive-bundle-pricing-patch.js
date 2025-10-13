// ADDITIVE BUNDLE PRICING - Replace the calculatePricing function in app.js
// This handles the new additive bundle format with components array

calculatePricing(serviceId) {
    const sqft = parseInt(document.getElementById(`sqft_${serviceId}`).value);
    const resultDiv = document.getElementById(`result_${serviceId}`);
    const pricingDiv = document.getElementById(`pricing_${serviceId}`);
    const rangeDiv = document.getElementById(`range_${serviceId}`);

    if (!sqft || sqft <= 0) {
        resultDiv.classList.remove('show');
        return;
    }

    // Find the service card and get its pricing data
    const serviceCard = document.querySelector(`[data-service-id="${serviceId}"]`);

    if (!serviceCard || !serviceCard._pricingData) {
        pricingDiv.innerHTML = '<div class="price-display-item"><div class="price-display-value">No pricing tiers available</div></div>';
        rangeDiv.textContent = '';
        resultDiv.classList.add('show');
        return;
    }

    const pricingTiers = serviceCard._pricingData;

    console.log('🧮 Pricing Calculator Debug:', {
        sqft: sqft,
        totalTiers: pricingTiers.length
    });

    // Find ALL tiers matching the square footage (for bundle components)
    const matchingTiers = pricingTiers.filter(t => {
        const matches = sqft >= t.sqftMin && sqft <= t.sqftMax;
        console.log(`  ${t.serviceType || t.acreage || 'Tier'}: [${t.sqftMin}-${t.sqftMax}] ${matches ? '✓' : '✗'}`);
        return matches;
    });

    console.log('Matched', matchingTiers.length, 'tiers');

    if (matchingTiers.length === 0) {
        pricingDiv.innerHTML = `
            <div class="price-display-item">
                <div class="price-display-value">No pricing available for ${sqft.toLocaleString()} sq ft</div>
            </div>
        `;
        rangeDiv.textContent = 'Please contact office for custom pricing';
        resultDiv.classList.add('show');
        return;
    }

    // Get the first matching tier
    const tier = matchingTiers[0];
    
    // Check for NEW additive bundle format (with components array)
    if (tier.components && Array.isArray(tier.components) && tier.components.length > 0) {
        console.log('✨ Using NEW additive bundle format');
        
        let html = '<div class="sqft-bundle-breakdown additive">';
        
        // Display each component with prices
        tier.components.forEach((comp, index) => {
            const isLast = index === tier.components.length - 1;
            html += `
                <div class="bundle-component-additive-row">
                    <div class="component-name-with-code">
                        <span class="component-name">${comp.name}</span>
                        ${comp.shortCode ? `<span class="component-code">(${comp.shortCode})</span>` : ''}
                    </div>
                    <div class="component-prices-additive">
                        ${comp.firstPrice ? `<div class="price-item"><span class="price-label-sm">First:</span><strong class="price-value-comp">${comp.firstPrice}</strong></div>` : ''}
                        ${comp.recurringPrice ? `<div class="price-item"><span class="price-label-sm">Recurring:</span><strong class="price-value-comp">${comp.recurringPrice}</strong></div>` : ''}
                    </div>
                </div>
            `;
            
            // Add plus sign between components
            if (!isLast) {
                html += '<div class="plus-sign-divider"><span class="plus-sign">+</span></div>';
            }
        });
        
        // Add equals sign divider
        html += '<div class="equals-sign-divider"><span class="equals-sign">=</span></div>';
        
        // Display total with highlighted styling
        html += `
            <div class="bundle-total-additive-row">
                <div class="bundle-total-label-additive">
                    <strong>Total Bundle Price</strong>
                </div>
                <div class="bundle-total-prices-additive">
                    ${tier.totalFirst ? `<div class="total-price-item"><span class="price-label-sm">First:</span><strong class="price-value-total">${tier.totalFirst}</strong></div>` : ''}
                    ${tier.totalRecurring ? `<div class="total-price-item"><span class="price-label-sm">Recurring:</span><strong class="price-value-total">${tier.totalRecurring}</strong></div>` : ''}
                </div>
            </div>
        `;
        
        html += '</div>';
        pricingDiv.innerHTML = html;
        
        const acreageText = tier.acreage ? ` (${tier.acreage})` : '';
        rangeDiv.textContent = `Valid for ${tier.sqftMin.toLocaleString()} - ${tier.sqftMax.toLocaleString()} sq ft${acreageText}`;
        
    } else {
        // Check for OLD bundle format (backward compatibility)
        const bundleTotal = matchingTiers.find(t => t.serviceType && t.serviceType.includes('Bundle Total'));
        const components = matchingTiers.filter(t => t.serviceType && t.serviceType.startsWith('Component:'));

        console.log('📦 Using OLD bundle format (Bundle Total / Component:)');

        if (bundleTotal || components.length > 0) {
            // This is bundle pricing with square footage tiers (old format)
            let html = '<div class="sqft-bundle-breakdown">';
            
            // Display bundle total first
            if (bundleTotal) {
                html += `
                    <div class="bundle-total-row">
                        <div class="bundle-total-label">
                            <strong>Total Bundle Price</strong>
                        </div>
                        <div class="bundle-total-prices-inline">
                            ${bundleTotal.firstPrice ? `<div class="bundle-price-inline"><span>First:</span><strong>${bundleTotal.firstPrice}</strong></div>` : ''}
                            ${bundleTotal.recurringPrice ? `<div class="bundle-price-inline"><span>Recurring:</span><strong>${bundleTotal.recurringPrice}</strong></div>` : ''}
                        </div>
                    </div>
                `;
            }
            
            // Display components
            if (components.length > 0) {
                html += '<div class="bundle-components-breakdown">';
                html += '<div class="components-header">Includes:</div>';
                components.forEach(comp => {
                    const componentName = comp.serviceType.replace('Component:', '').trim();
                    html += `
                        <div class="bundle-component-row">
                            <div class="component-name">${componentName}</div>
                            <div class="component-prices">
                                ${comp.firstPrice ? `<span class="comp-price">First: ${comp.firstPrice}</span>` : ''}
                                ${comp.recurringPrice ? `<span class="comp-price">Recurring: ${comp.recurringPrice}</span>` : ''}
                                ${!comp.firstPrice && !comp.recurringPrice ? '<span class="comp-price included">Included</span>' : ''}
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            html += '</div>';
            pricingDiv.innerHTML = html;
            
            rangeDiv.textContent = `Valid for ${tier.sqftMin.toLocaleString()} - ${tier.sqftMax.toLocaleString()} sq ft`;
        } else {
            // Standard single-tier pricing
            pricingDiv.innerHTML = `
                <div class="price-display-item">
                    <div class="price-display-label">First Service</div>
                    <div class="price-display-value">${tier.firstPrice}</div>
                </div>
                <div class="price-display-item">
                    <div class="price-display-label">Recurring</div>
                    <div class="price-display-value">${tier.recurringPrice}</div>
                </div>
                <div class="price-display-item">
                    <div class="price-display-label">Service Type</div>
                    <div class="price-display-value">${tier.serviceType}</div>
                </div>
            `;
            rangeDiv.textContent = `Valid for ${tier.sqftMin.toLocaleString()} - ${tier.sqftMax.toLocaleString()} sq ft`;
        }
    }

    resultDiv.classList.add('show');
}

