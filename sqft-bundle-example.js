// Example: Square Footage-Based Bundle Pricing
// This is the format you used - bundle pricing that varies by property size

const sqftBasedBundleService = {
  name: "Total Protection Bundle",
  frequency: "Monthly",
  billingFrequency: "Monthly",
  description: "Complete pest protection bundle with pricing based on property size",
  
  // This uses the pricingTiers structure with "Bundle Total" and "Component:" serviceType
  pricingTiers: [
    // Small Property (0-2500 sqft)
    {
      sqftMin: 0,
      sqftMax: 2500,
      firstPrice: "",
      recurringPrice: "$139.00",
      serviceType: "Bundle Total"
    },
    {
      sqftMin: 0,
      sqftMax: 2500,
      firstPrice: "",
      recurringPrice: "",  // Empty means "Included"
      serviceType: "Component: Barrier360"
    },
    {
      sqftMin: 0,
      sqftMax: 2500,
      firstPrice: "",
      recurringPrice: "$65.00",
      serviceType: "Component: Mosquito"
    },
    {
      sqftMin: 0,
      sqftMax: 2500,
      firstPrice: "",
      recurringPrice: "$35.00",
      serviceType: "Component: Termite"
    },
    
    // Large Property (2501-100000 sqft)
    {
      sqftMin: 2501,
      sqftMax: 100000,
      firstPrice: "",
      recurringPrice: "$159.00",
      serviceType: "Bundle Total"
    },
    {
      sqftMin: 2501,
      sqftMax: 100000,
      firstPrice: "",
      recurringPrice: "",  // Empty means "Included"
      serviceType: "Component: Barrier360"
    },
    {
      sqftMin: 2501,
      sqftMax: 100000,
      firstPrice: "",
      recurringPrice: "$70.00",
      serviceType: "Component: Mosquito"
    },
    {
      sqftMin: 2501,
      sqftMax: 100000,
      firstPrice: "",
      recurringPrice: "$40.00",
      serviceType: "Component: Termite"
    }
  ]
};

// HOW IT DISPLAYS:
// 
// User enters 2000 sqft:
// ┌──────────────────────────────────────┐
// │  Total Bundle Price                  │
// │  Recurring: $139.00                  │
// ├──────────────────────────────────────┤
// │  Includes:                           │
// │  Barrier360           Included       │
// │  Mosquito          Recurring: $65.00 │
// │  Termite           Recurring: $35.00 │
// └──────────────────────────────────────┘
// Valid for 0 - 2,500 sq ft
//
// User enters 3000 sqft:
// ┌──────────────────────────────────────┐
// │  Total Bundle Price                  │
// │  Recurring: $159.00                  │
// ├──────────────────────────────────────┤
// │  Includes:                           │
// │  Barrier360           Included       │
// │  Mosquito          Recurring: $70.00 │
// │  Termite           Recurring: $40.00 │
// └──────────────────────────────────────┘
// Valid for 2,501 - 100,000 sq ft

// RULES:
// 1. "Bundle Total" in serviceType = This is the total bundle price line
// 2. "Component: X" in serviceType = This is a component breakdown
// 3. Empty prices show as "Included"
// 4. Can have as many sqft tiers as needed
// 5. Each sqft range needs one "Bundle Total" and its components

// Multiple tier example:
const multiTierBundleService = {
  name: "Premium Protection Bundle",
  frequency: "Monthly",
  billingFrequency: "Monthly",
  description: "Premium protection with multiple pricing tiers",
  
  pricingTiers: [
    // Tier 1: Small homes (0-1500 sqft)
    { sqftMin: 0, sqftMax: 1500, firstPrice: "", recurringPrice: "$99.00", serviceType: "Bundle Total" },
    { sqftMin: 0, sqftMax: 1500, firstPrice: "", recurringPrice: "", serviceType: "Component: General Pest" },
    { sqftMin: 0, sqftMax: 1500, firstPrice: "", recurringPrice: "$45.00", serviceType: "Component: Mosquito" },
    { sqftMin: 0, sqftMax: 1500, firstPrice: "", recurringPrice: "$29.00", serviceType: "Component: Termite" },
    
    // Tier 2: Medium homes (1501-2500 sqft)
    { sqftMin: 1501, sqftMax: 2500, firstPrice: "", recurringPrice: "$129.00", serviceType: "Bundle Total" },
    { sqftMin: 1501, sqftMax: 2500, firstPrice: "", recurringPrice: "", serviceType: "Component: General Pest" },
    { sqftMin: 1501, sqftMax: 2500, firstPrice: "", recurringPrice: "$55.00", serviceType: "Component: Mosquito" },
    { sqftMin: 1501, sqftMax: 2500, firstPrice: "", recurringPrice: "$39.00", serviceType: "Component: Termite" },
    
    // Tier 3: Large homes (2501-4000 sqft)
    { sqftMin: 2501, sqftMax: 4000, firstPrice: "", recurringPrice: "$159.00", serviceType: "Bundle Total" },
    { sqftMin: 2501, sqftMax: 4000, firstPrice: "", recurringPrice: "", serviceType: "Component: General Pest" },
    { sqftMin: 2501, sqftMax: 4000, firstPrice: "", recurringPrice: "$70.00", serviceType: "Component: Mosquito" },
    { sqftMin: 2501, sqftMax: 4000, firstPrice: "", recurringPrice: "$49.00", serviceType: "Component: Termite" },
    
    // Tier 4: Extra large homes (4001+ sqft)
    { sqftMin: 4001, sqftMax: 100000, firstPrice: "", recurringPrice: "$199.00", serviceType: "Bundle Total" },
    { sqftMin: 4001, sqftMax: 100000, firstPrice: "", recurringPrice: "", serviceType: "Component: General Pest" },
    { sqftMin: 4001, sqftMax: 100000, firstPrice: "", recurringPrice: "$90.00", serviceType: "Component: Mosquito" },
    { sqftMin: 4001, sqftMax: 100000, firstPrice: "", recurringPrice: "$59.00", serviceType: "Component: Termite" }
  ]
};

// You can also include firstPrice if you have initial setup fees:
const bundleWithFirstPrice = {
  name: "Complete Care Bundle",
  frequency: "Quarterly",
  billingFrequency: "Quarterly",
  description: "Complete care bundle with setup fee",
  
  pricingTiers: [
    { sqftMin: 0, sqftMax: 2500, firstPrice: "$199.00", recurringPrice: "$89.00", serviceType: "Bundle Total" },
    { sqftMin: 0, sqftMax: 2500, firstPrice: "$100.00", recurringPrice: "", serviceType: "Component: Initial Inspection" },
    { sqftMin: 0, sqftMax: 2500, firstPrice: "$49.00", recurringPrice: "$40.00", serviceType: "Component: Pest Control" },
    { sqftMin: 0, sqftMax: 2500, firstPrice: "$50.00", recurringPrice: "$49.00", serviceType: "Component: Termite" }
  ]
};

// Export for use
module.exports = {
  sqftBasedBundleService,
  multiTierBundleService,
  bundleWithFirstPrice
};

