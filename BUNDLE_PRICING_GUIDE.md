# Bundle Pricing Feature Guide

## Overview
The profile system now supports **Bundle Pricing** in addition to the standard square footage-based pricing calculator. This allows you to display services that consist of multiple components with individual pricing that sum to a total bundle price.

## When to Use Bundle Pricing vs. Square Footage Pricing

### Use Bundle Pricing When:
- Service packages include multiple sub-services (e.g., Mosquito + Fly + Tick control)
- Pricing is fixed regardless of property size
- You want to show itemized breakdown of what's included
- Multiple services are sold as a package deal

### Use Square Footage Pricing When:
- Pricing varies based on property size
- Single service with tiered pricing structure
- Need customers to calculate their specific price

## Data Structure for Bundle Services

To create a bundle service, add the following properties to your service object:

```javascript
{
  name: "Bundle - Total Yard",           // Service name (include "Bundle -" for clarity)
  isBundle: true,                        // Flag to indicate this is a bundle
  frequency: "Monthly",                  // Service frequency
  billingFrequency: "Monthly",           // Billing frequency
  description: "Complete yard protection package",
  
  // Bundle-specific properties
  bundleLabel: "Total Yard",             // Display name for the bundle
  bundleTotalFirst: "$99.00",            // Total first service price
  bundleTotalRecurring: "$99.00",        // Total recurring price
  
  // Array of components included in the bundle
  bundleComponents: [
    {
      name: "Mosquito",                  // Component service name
      frequency: "21 days",              // How often this component is serviced
      firstPrice: "$49.50",              // Component first price
      recurringPrice: "$49.50"           // Component recurring price
    },
    {
      name: "Fly",
      frequency: "21 days",
      firstPrice: "$24.75",
      recurringPrice: "$24.75"
    },
    {
      name: "Tick",
      frequency: "21 days",
      firstPrice: "$24.75",
      recurringPrice: "$24.75"
    }
  ]
}
```

## Complete Example

Here's a complete example showing multiple bundle tiers for a client:

```javascript
const services = [
  // Bundle - Basic Package
  {
    name: "Bundle - Basic",
    isBundle: true,
    frequency: "Monthly",
    billingFrequency: "Monthly",
    description: "Essential pest protection with barrier treatment and mosquito control",
    bundleLabel: "Basic",
    bundleTotalFirst: "$89.00",
    bundleTotalRecurring: "$89.00",
    bundleComponents: [
      {
        name: "Barrier 360",
        frequency: "Quarterly",
        firstPrice: "$35.60",
        recurringPrice: "$35.60"
      },
      {
        name: "Mosquito",
        frequency: "21 days",
        firstPrice: "$53.40",
        recurringPrice: "$53.40"
      }
    ]
  },
  
  // Bundle - Plus Package
  {
    name: "Bundle - Plus",
    isBundle: true,
    frequency: "Monthly",
    billingFrequency: "Monthly",
    description: "Enhanced protection adding fly and tick control",
    bundleLabel: "Plus",
    bundleTotalFirst: "$129.00",
    bundleTotalRecurring: "$129.00",
    bundleComponents: [
      {
        name: "Barrier 360",
        frequency: "Quarterly",
        firstPrice: "$32.25",
        recurringPrice: "$32.25"
      },
      {
        name: "Mosquito",
        frequency: "21 days",
        firstPrice: "$45.15",
        recurringPrice: "$45.15"
      },
      {
        name: "Fly",
        frequency: "21 days",
        firstPrice: "$25.80",
        recurringPrice: "$25.80"
      },
      {
        name: "Tick",
        frequency: "21 days",
        firstPrice: "$25.80",
        recurringPrice: "$25.80"
      }
    ]
  },
  
  // Bundle - Advantage Package
  {
    name: "Bundle - Advantage",
    isBundle: true,
    frequency: "Monthly",
    billingFrequency: "Monthly",
    description: "Complete protection with all services included",
    bundleLabel: "Advantage",
    bundleTotalFirst: "$159.00",
    bundleTotalRecurring: "$159.00",
    bundleComponents: [
      {
        name: "Barrier 360",
        frequency: "Quarterly",
        firstPrice: "$39.75",
        recurringPrice: "$39.75"
      },
      {
        name: "Rodent Control",
        frequency: "Quarterly",
        firstPrice: "$23.85",
        recurringPrice: "$23.85"
      },
      {
        name: "Mosquito",
        frequency: "21 days",
        firstPrice: "$39.75",
        recurringPrice: "$39.75"
      },
      {
        name: "Fly",
        frequency: "21 days",
        firstPrice: "$15.90",
        recurringPrice: "$15.90"
      },
      {
        name: "Tick",
        frequency: "21 days",
        firstPrice: "$7.95",
        recurringPrice: "$7.95"
      },
      {
        name: "Termite Protection",
        frequency: "Annual",
        firstPrice: "$31.80",
        recurringPrice: "$31.80"
      }
    ]
  },
  
  // Standard Service (for comparison)
  {
    name: "General Pest Control",
    frequency: "Quarterly",
    billingFrequency: "Quarterly",
    description: "Standard pest control service",
    firstPrice: "$150",
    recurringPrice: "$45",
    // This will use the square footage calculator
    pricingTiers: [
      {
        sqftMin: 0,
        sqftMax: 2500,
        firstPrice: "$150",
        recurringPrice: "$45",
        serviceType: "Standard Home"
      },
      {
        sqftMin: 2501,
        sqftMax: 5000,
        firstPrice: "$200",
        recurringPrice: "$65",
        serviceType: "Large Home"
      }
    ]
  }
];
```

## Display Behavior

### Bundle Services Will Display:
- 📦 Bundle Pricing icon/title
- List of all component services with individual prices
- Service frequency for each component
- Total bundle price (highlighted)
- Billing frequency
- No square footage input (bundles are fixed price)

### Standard Services Will Display:
- 🧮 Pricing Calculator icon/title
- Square footage input field
- Calculate button
- Calculated pricing based on property size
- Valid square footage range

## Converting CSV Data to Bundle Format

If you have bundle data in CSV format like your example:

```csv
8957,MAPA - Hickory,Bundle - Total Yard,Mosquito,21 days,Monthly,$49.50,$49.50,0,999999
8957,MAPA - Hickory,Bundle - Total Yard,Fly,21 days,Monthly,$24.75,$24.75,0,999999
8957,MAPA - Hickory,Bundle - Total Yard,Tick,21 days,Monthly,$24.75,$24.75,0,999999
8957,MAPA - Hickory,Bundle - Total Yard,**Total Price**,,,**$99.00**,**$99.00**,0,999999
```

You can convert it using this pattern:

```javascript
// Group by bundle name
const bundles = {};

csvRows.forEach(row => {
  const [clientId, clientName, bundleName, serviceName, frequency, billing, first, recurring] = row;
  
  if (serviceName === "**Total Price**") {
    // This is the total row
    bundles[bundleName].bundleTotalFirst = first;
    bundles[bundleName].bundleTotalRecurring = recurring;
  } else {
    // This is a component
    if (!bundles[bundleName]) {
      bundles[bundleName] = {
        name: bundleName,
        isBundle: true,
        bundleComponents: [],
        frequency: billing,
        billingFrequency: billing
      };
    }
    
    bundles[bundleName].bundleComponents.push({
      name: serviceName,
      frequency: frequency,
      firstPrice: first,
      recurringPrice: recurring
    });
  }
});
```

## Apps Script Integration

When storing bundle data in Google Sheets, use the `Pricing_Data` column format:

```json
{
  "isBundle": true,
  "bundleLabel": "Total Yard",
  "bundleTotalFirst": "$99.00",
  "bundleTotalRecurring": "$99.00",
  "bundleComponents": [
    {"name": "Mosquito", "frequency": "21 days", "firstPrice": "$49.50", "recurringPrice": "$49.50"},
    {"name": "Fly", "frequency": "21 days", "firstPrice": "$24.75", "recurringPrice": "$24.75"},
    {"name": "Tick", "frequency": "21 days", "firstPrice": "$24.75", "recurringPrice": "$24.75"}
  ]
}
```

## Styling Customization

The bundle pricing uses these CSS classes that you can customize:

- `.bundle-pricing-container` - Main container
- `.bundle-components-list` - List of components
- `.bundle-component-item` - Individual component row
- `.bundle-total-pricing` - Total price section (highlighted in green)
- `.component-price-item` - Price display for each component
- `.total-value` - Total price value (large, bold, glowing)

## Mobile Responsiveness

Bundle pricing automatically adapts to mobile screens:
- Components stack vertically
- Pricing displays side-by-side within each component
- Total pricing remains prominent

## Best Practices

1. **Clear Naming**: Use "Bundle -" prefix in service names
2. **Component Frequency**: Always include frequency for each component
3. **Price Formatting**: Use consistent price formatting ($XX.XX)
4. **Bundle Labels**: Use short, descriptive labels (Basic, Plus, Premium, etc.)
5. **Order Components**: List components in logical order (most important first)
6. **Total Verification**: Ensure component prices add up to the total

## Troubleshooting

### Bundle Not Displaying
- Check that `isBundle: true` OR `bundleComponents` array exists
- Verify `bundleComponents` is an array with at least one item

### Missing Component Data
- Ensure each component has `name`, `firstPrice`, and `recurringPrice`
- Frequency is optional but recommended

### Total Not Showing
- Verify `bundleTotalFirst` and `bundleTotalRecurring` are present
- Check that values are strings in price format ("$XX.XX")

## Feature Compatibility

✅ **Works With:**
- Standard service cards
- Multiple bundles per client
- Mixed bundle and non-bundle services
- Mobile responsive design
- All browsers

❌ **Not Compatible With:**
- Square footage calculator (bundles use fixed pricing)
- Pricing tiers based on property size

---

## Need Help?

If you have questions about implementing bundle pricing or need help converting your data format, refer to the example data above or check the `app.js` file for the implementation details.

