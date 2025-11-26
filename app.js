// Main Application JavaScript - Complete Call Center Profile System
// VERSION: 2025-11-26-ALERTS-V1
console.log('🔵 App.js Version: 2025-11-26-ALERTS-V1');
class GitHubProfileViewer {
    constructor() {
        this.clientData = {};
        this.isWixEnvironment = window.CONFIG?.WIX?.IS_WIX_ENVIRONMENT || false;
        this.profileId = this.getProfileIdFromURL();
        this.init();
    }

    async init() {
        try {
            // Load client data
            await this.loadClientData();
            
            // Initialize components
            this.initializeEventListeners();
            this.populateClientData();
            
            // Hide loading state
            document.getElementById('loadingState').style.display = 'none';
            
            // Initialize sticky header after DOM is ready
            setTimeout(() => this.initializeStickyHeader(), 200);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load client data');
        }
    }

    async loadClientData() {
        try {
            if (this.isWixEnvironment) {
                // Load from Wix CMS
                this.clientData = await this.loadFromWixCMS();
            } else {
                // Load from URL parameters or Google Sheets
                this.clientData = await this.loadFromDataSource();
            }
        } catch (error) {
            console.error('Error loading client data:', error);
            // Fallback to sample data
            this.clientData = CONFIG.FALLBACK_DATA;
        }
    }

    async loadFromWixCMS() {
        // This will be implemented when deployed to Wix
        if (typeof wixData !== 'undefined') {
            const clientId = this.getClientIdFromURL();
            
            try {
                // Query client data from Wix CMS collections
                const client = await wixData.query(CONFIG.WIX.COLLECTIONS.CLIENTS)
                    .eq('_id', clientId)
                    .find();
                
                if (client.items.length > 0) {
                    const clientInfo = client.items[0];
                    
                    // Load related data
                    const [services, technicians, policies, serviceAreas] = await Promise.all([
                        this.loadWixCollection(CONFIG.WIX.COLLECTIONS.SERVICES, 'clientId', clientId),
                        this.loadWixCollection(CONFIG.WIX.COLLECTIONS.TECHNICIANS, 'clientId', clientId),
                        this.loadWixCollection(CONFIG.WIX.COLLECTIONS.POLICIES, 'clientId', clientId),
                        this.loadWixCollection(CONFIG.WIX.COLLECTIONS.SERVICE_AREAS, 'clientId', clientId)
                    ]);

                    return {
                        ...clientInfo,
                        services: services.items,
                        technicians: technicians.items,
                        policies: this.organizePolicies(policies.items),
                        serviceAreas: serviceAreas.items
                    };
                }
            } catch (error) {
                console.error('Error loading from Wix CMS:', error);
                throw error;
            }
        }
        
        throw new Error('Wix environment not available');
    }

    async loadWixCollection(collectionName, filterField, filterValue) {
        return await wixData.query(collectionName)
            .eq(filterField, filterValue)
            .find();
    }

    async loadFromDataSource() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check for profile ID parameter (primary method)
        const profileId = urlParams.get('profileId');
        if (profileId && CONFIG.GOOGLE_SHEETS.WEB_APP_URL) {
            return await this.loadFromGoogleAppsScript(profileId);
        }
        
        // Check if data is passed from Wix or URL parameters
        if (urlParams.has('companyName')) {
            return this.parseURLParams(urlParams);
        }
        
        // Try to load from Google Sheets (legacy method)
        const sheetId = urlParams.get('sheetId');
        if (sheetId && CONFIG.GOOGLE_SHEETS.WEB_APP_URL) {
            return await this.loadFromGoogleSheets(sheetId);
        }
        
        // Fallback to sample data
        return this.loadSampleData();
    }

    async loadFromGoogleAppsScript(profileId) {
        try {
            const apiUrl = `${CONFIG.GOOGLE_SHEETS.WEB_APP_URL}?action=getProfile&profileId=${encodeURIComponent(profileId)}`;
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                Logger.log('Successfully loaded profile from Google Apps Script');
                return result.data;
            } else {
                throw new Error(result.error || 'Invalid response from Google Apps Script');
            }
            
        } catch (error) {
            console.error('Error loading from Google Apps Script:', error);
            
            // Show user-friendly error message
            this.showError(`Failed to load profile data: ${error.message}`);
            
            // Fallback to sample data for development
            return this.loadSampleData();
        }
    }

    parseURLParams(urlParams) {
        const clientData = {
            companyName: urlParams.get('companyName') || 'Unknown Company',
            location: urlParams.get('location') || '',
            timezone: urlParams.get('timezone') || 'Central',
            officeInfo: {
                phone: urlParams.get('phone') || '',
                email: urlParams.get('email') || '',
                website: urlParams.get('website') || '',
                fieldRoutesLink: urlParams.get('fieldRoutesLink') || '',
                physicalAddress: urlParams.get('address') || '',
                officeHours: urlParams.get('hours') || ''
            },
            bulletin: urlParams.get('bulletin') || '',
            pestsNotCovered: urlParams.get('pestsNotCovered') || '',
            services: [],
            technicians: [],
            policies: {},
            serviceAreas: []
        };

        // Parse JSON parameters if provided
        ['services', 'technicians', 'policies', 'serviceAreas'].forEach(param => {
            const value = urlParams.get(param);
            if (value) {
                try {
                    clientData[param] = JSON.parse(decodeURIComponent(value));
                } catch (e) {
                    console.error(`Error parsing ${param}:`, e);
                }
            }
        });

        return clientData;
    }

    async loadFromGoogleSheets(sheetId) {
        try {
            const response = await fetch(`${CONFIG.GOOGLE_SHEETS.WEB_APP_URL}?sheetId=${sheetId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch from Google Sheets');
            }
            
            const data = await response.json();
            return this.formatGoogleSheetsData(data);
        } catch (error) {
            console.error('Error loading from Google Sheets:', error);
            throw error;
        }
    }

    formatGoogleSheetsData(rawData) {
        // Transform Google Sheets data into the expected format
        return {
            companyName: rawData.companyName || 'Unknown Company',
            location: rawData.location || '',
            timezone: rawData.timezone || 'Central',
            officeInfo: rawData.officeInfo || {},
            bulletin: rawData.bulletin || '',
            pestsNotCovered: rawData.pestsNotCovered || '',
            services: rawData.services || [],
            technicians: rawData.technicians || [],
            policies: this.organizePolicies(rawData.policies || []),
            serviceAreas: rawData.serviceAreas || []
        };
    }

    loadSampleData() {
        // Return comprehensive sample data matching original wix-profile-page.html
        return {
            companyName: "SOS Exterminating",
            location: "Dallas, TX",
            timezone: "Central",
            officeInfo: {
                phone: "(214) 555-4567",
                email: "dallas@sosexterminating.com",
                website: "https://sosexterminating.com",
                fieldRoutesLink: "https://fieldroutes.com",
                physicalAddress: "123 Main Street\nDallas, TX 75201",
                officeHours: "Monday-Friday: 8 AM - 5 PM"
            },
            bulletin: "This is test data - no Wix connection detected",
            pestsNotCovered: "Carpenter Ants, Bed Bugs, Termites (requires separate treatment)",
            services: [{
                name: "General Pest Control",
                description: "Comprehensive pest control service with multiple frequency options to meet your specific needs",
                serviceType: "General Pest Control",
                queueExt: "6884",
                productType: "General Pest Control",
                contract: "12 Months",
                guarantee: "90-day guarantee",
                duration: "45 minutes",
                billingFrequency: "After service completion",
                agentNote: "IMPORTANT: Always confirm property square footage before quoting. Ask about previous pest issues to recommend appropriate frequency.",
                subServices: [
                    {
                        name: "Monthly GPC",
                        frequency: "Monthly",
                        description: "Premium monthly pest control for maximum protection year-round",
                        pests: "Ants, Roaches, Spiders, Crickets, Silverfish, Earwigs, Pill Bugs",
                        contract: "12 Months",
                        guarantee: "90-day guarantee",
                        duration: "45-60 minutes",
                        serviceType: "Monthly GPC",
                        productType: "General Pest Control - Monthly",
                        billingFrequency: "Monthly after service",
                        agentNote: "Monthly service recommended for high pest pressure areas or customers with pest phobia. Emphasize year-round protection.",
                        pricingTiers: [
                            { sqftMin: 0, sqftMax: 2500, firstPrice: "$135.00", recurringPrice: "$130.00", serviceType: "Monthly GPC" },
                            { sqftMin: 2501, sqftMax: 3000, firstPrice: "$145.00", recurringPrice: "$140.00", serviceType: "Monthly GPC" },
                            { sqftMin: 3001, sqftMax: 4000, firstPrice: "$155.00", recurringPrice: "$150.00", serviceType: "Monthly GPC" },
                            { sqftMin: 4001, sqftMax: 999999, firstPrice: "Requires Client Follow-Up", recurringPrice: "", serviceType: "Monthly GPC" }
                        ]
                    },
                    {
                        name: "Quarterly GPC",
                        frequency: "Quarterly",
                        description: "Standard quarterly pest control service with seasonal treatments",
                        pests: "Ants, Roaches, Spiders, Crickets, Silverfish",
                        contract: "12 Months",
                        guarantee: "90-day guarantee",
                        duration: "45 minutes",
                        serviceType: "Quarterly GPC",
                        productType: "General Pest Control - Quarterly",
                        billingFrequency: "Quarterly after service",
                        agentNote: "Most popular option. Good for moderate pest pressure. Remind customers about seasonal variations in pest activity.",
                        pricingTiers: [
                            { sqftMin: 0, sqftMax: 2500, firstPrice: "$125.00", recurringPrice: "$120.00", serviceType: "Quarterly GPC" },
                            { sqftMin: 2501, sqftMax: 3000, firstPrice: "$130.00", recurringPrice: "$125.00", serviceType: "Quarterly GPC" },
                            { sqftMin: 3001, sqftMax: 4000, firstPrice: "$140.00", recurringPrice: "$135.00", serviceType: "Quarterly GPC" },
                            { sqftMin: 4001, sqftMax: 999999, firstPrice: "Requires Client Follow-Up", recurringPrice: "", serviceType: "Quarterly GPC" }
                        ]
                    },
                    {
                        name: "Bi-Monthly GPC",
                        frequency: "Bi-Monthly",
                        description: "Enhanced bi-monthly service for moderate to high pest pressure areas",
                        pests: "Ants, Roaches, Spiders, Crickets, Silverfish, Centipedes",
                        contract: "12 Months",
                        guarantee: "90-day guarantee",
                        duration: "45-50 minutes",
                        serviceType: "Bi-Monthly GPC",
                        productType: "General Pest Control - Bi-Monthly",
                        billingFrequency: "Bi-monthly after service",
                        agentNote: "Good middle-ground option. Recommend for customers who want more than quarterly but find monthly excessive.",
                        pricingTiers: [
                            { sqftMin: 0, sqftMax: 2500, firstPrice: "$130.00", recurringPrice: "$125.00", serviceType: "Bi-Monthly GPC" },
                            { sqftMin: 2501, sqftMax: 3000, firstPrice: "$138.00", recurringPrice: "$133.00", serviceType: "Bi-Monthly GPC" },
                            { sqftMin: 3001, sqftMax: 4000, firstPrice: "$148.00", recurringPrice: "$143.00", serviceType: "Bi-Monthly GPC" },
                            { sqftMin: 4001, sqftMax: 999999, firstPrice: "Requires Client Follow-Up", recurringPrice: "", serviceType: "Bi-Monthly GPC" }
                        ]
                    }
                ]
            }, {
                name: "Monthly Mosquito Service",
                description: "Monthly mosquito, flea, and tick control",
                contract: "Seasonal",
                guarantee: "30-day guarantee",
                duration: "30 minutes",
                pests: "Mosquitoes, Fleas, Ticks",
                serviceType: "Monthly Mosquito",
                queueExt: "6884",
                productType: "Mosquito - Flea - Tick",
                frequency: "Monthly",
                billingFrequency: "After service completion",
                agentNote: "Seasonal service typically runs April through October. Emphasize outdoor living enhancement and tick disease prevention.",
                pricingTiers: [
                    { sqftMin: 0, sqftMax: 10890, firstPrice: "$108.00", recurringPrice: "$108.00", serviceType: "Monthly Mosquito" },
                    { sqftMin: 10891, sqftMax: 21780, firstPrice: "$120.00", recurringPrice: "$118.00", serviceType: "Monthly Mosquito" },
                    { sqftMin: 21781, sqftMax: 32680, firstPrice: "$132.00", recurringPrice: "$128.00", serviceType: "Monthly Mosquito" },
                    { sqftMin: 32681, sqftMax: 43560, firstPrice: "$144.00", recurringPrice: "$138.00", serviceType: "Monthly Mosquito" },
                    { sqftMin: 43561, sqftMax: 999999, firstPrice: "Requires Client Follow-Up", recurringPrice: "", serviceType: "Monthly Mosquito" }
                ]
            }],
            technicians: [{
                name: "John Smith",
                company: "SOS Exterminating",
                role: "Both",
                phone: "(214) 555-0001",
                schedule: "Mon-Fri 8-5 Saturday 8-12",
                maxStops: "12",
                doesNotService: "",
                additionalNotes: "Preferred technician for North Dallas area",
                zipCodes: ["75001", "75002", "75010", "75011"]
            }, {
                name: "Sarah Johnson", 
                company: "SOS Exterminating",
                role: "Inspector",
                phone: "(214) 555-0002",
                schedule: "Mon-Fri 9-4",
                maxStops: "8",
                doesNotService: "Does not service regular services – schedule inspections only",
                additionalNotes: "Commercial inspections specialist",
                zipCodes: ["75001", "75002", "75020", "75021"]
            }, {
                name: "Mike Wilson",
                company: "SOS Exterminating", 
                role: "Technician",
                phone: "(214) 555-0003",
                schedule: "Mon-Thur 8-5, Fri 8-3",
                maxStops: "10",
                doesNotService: "Termite, Mosquito/Tick",
                additionalNotes: "Covers weekend emergency calls",
                zipCodes: ["75030", "75031", "75040", "75041"]
            }],
            policies: {
                "Service Coverage": [
                    {
                        type: "vehicles",
                        title: "Do we treat vehicles",
                        description: "Policy regarding pest control services for vehicles and automotive properties.",
                        options: ["Yes", "No", "Case by case"],
                        default: "No"
                    },
                    {
                        type: "commercial",
                        title: "Commercial Properties",
                        description: "Availability of pest control services for commercial and business properties.",
                        options: ["Available", "Not Available", "Limited Service"],
                        default: "Available"
                    },
                    {
                        type: "multifamily",
                        title: "Multi-Family Offered",
                        description: "Pest control services for apartment complexes, condominiums, and multi-unit residential properties.",
                        options: ["Yes", "No", "Property Management Only"],
                        default: "Yes"
                    },
                    {
                        type: "mobile",
                        title: "Trailers/Mobile Homes",
                        description: "Pest control services for mobile homes, trailers, and manufactured housing.",
                        options: ["Yes", "No", "Restrictions Apply"],
                        default: "Yes"
                    }
                ],
                "Scheduling and Operations": [
                    {
                        type: "contract",
                        title: "Signed Contract",
                        description: "Requirements for signed service agreements before beginning pest control services.",
                        options: ["Required", "Not Required", "Verbal Agreement OK"],
                        default: "Required"
                    },
                    {
                        type: "returning",
                        title: "Returning Customers",
                        description: "Special policies and procedures for customers returning after service cancellation.",
                        options: ["Standard Pricing", "Welcome Back Discount", "Re-inspection Required"],
                        default: "Standard Pricing"
                    },
                    {
                        type: "confirmations",
                        title: "Appointment Confirmations",
                        description: "How and when appointment confirmations are sent to customers.",
                        options: ["24 hours prior", "48 hours prior", "Day of service"],
                        default: "24 hours prior"
                    },
                    {
                        type: "callahead",
                        title: "Call Ahead",
                        description: "Policy for technicians calling customers before arriving for service.",
                        options: ["Always call", "Call if requested", "No call policy"],
                        default: "Always call"
                    },
                    {
                        type: "distance",
                        title: "Max Distance",
                        description: "Maximum service distance from branch location for regular service calls.",
                        options: ["25 miles", "50 miles", "75 miles", "No limit"],
                        default: "50 miles"
                    },
                    {
                        type: "scheduling_times",
                        title: "Scheduling Policy Times",
                        description: "Standard time windows and scheduling policies for different service types.",
                        schedulingLayout: {
                            "Inspection": "8:00 AM - 5:00 PM",
                            "Initial/Interior": "8:00 AM - 4:00 PM", 
                            "Regular": "8:00 AM - 5:00 PM"
                        },
                        options: ["Standard Hours", "Extended Hours", "Flexible Schedule"],
                        default: "Standard Hours"
                    },
                    {
                        type: "sameday",
                        title: "Same Day Services",
                        description: "Availability and policies for same-day pest control services.",
                        options: ["Available", "Emergency Only", "Not Available"],
                        default: "Emergency Only"
                    },
                    {
                        type: "techskilling",
                        title: "Tech Skilling",
                        description: "Technician skill level requirements and specialization policies.",
                        options: ["All Techs", "Specialized Techs Only", "Senior Techs Preferred"],
                        default: "All Techs"
                    },
                    {
                        type: "emergency",
                        title: "After Hours Emergency",
                        description: "Emergency pest control services outside of normal business hours.",
                        options: ["Available", "Limited Availability", "Not Available"],
                        default: "Limited Availability"
                    }
                ],
                "Service Policies": [
                    {
                        type: "reservices",
                        title: "Reservices",
                        description: "Policy for repeat service calls within guarantee period due to continued pest activity.",
                        options: ["Free within 30 days", "Free within 60 days", "Free within 90 days"],
                        default: "Must allow 10-14 days for product to work. If customer has had more than 2 reservices on account, attempt to upsell service (QPC to Bi or Bi to Monthly). Exception: may schedule within 2 days of treatment for fleas."
                    },
                    {
                        type: "servicetype",
                        title: "Set Service Type To",
                        description: "Default service type classification for new service agreements.",
                        options: ["Monthly", "Quarterly", "Bi-Monthly", "One-Time"],
                        default: "Quarterly"
                    },
                    {
                        type: "subscription",
                        title: "Set Subscription Type To",
                        description: "Default subscription billing model for ongoing pest control services.",
                        options: ["Contract", "Month-to-Month", "Seasonal"],
                        default: "Contract"
                    }
                ],
                "Payment and Financial": [
                    {
                        type: "plans",
                        title: "Payment Plans",
                        description: "Available payment plan options for pest control services.",
                        options: ["Full Payment", "Split Payment", "Monthly Installments"],
                        default: "Full Payment"
                    },
                    {
                        type: "types",
                        title: "Payment Types",
                        description: "Accepted payment methods for pest control services.",
                        options: ["Cash, Check, Credit Card", "Credit Card Only", "Cash and Check Only"],
                        default: "Cash, Check, Credit Card"
                    },
                    {
                        type: "pastdue",
                        title: "Past Due Period",
                        description: "Grace period before accounts are considered past due and subject to late fees.",
                        options: ["15 days", "30 days", "45 days"],
                        default: "30 days"
                    },
                    {
                        type: "tools",
                        title: "Tools to Save",
                        description: "Available tools and options to help customers save money on pest control services.",
                        options: ["Annual Discounts", "Referral Credits", "Senior Discounts"],
                        default: "Annual Discounts"
                    },
                    {
                        type: "cancellation",
                        title: "Cancellation Policy",
                        description: "Terms and notice requirements for canceling pest control service contracts.",
                        options: ["30 day notice", "60 day notice", "End of contract"],
                        default: "30 day notice"
                    }
                ],
                "Additional Information": [
                    {
                        type: "liability",
                        title: "Liability and Insurance",
                        description: "Company maintains full liability insurance coverage. Customer should report any damages or concerns immediately.",
                        options: ["Full coverage", "Limited coverage", "Customer responsibility"],
                        default: "Full coverage"
                    },
                    {
                        type: "environmental",
                        title: "Environmental Safety",
                        description: "All treatments use EPA-approved products applied according to label instructions. Safety data sheets available upon request.",
                        options: ["Eco-friendly options", "Standard products", "Premium treatments"],
                        default: "Standard products"
                    },
                    {
                        type: "satisfaction",
                        title: "Customer Satisfaction Policy",
                        description: "Customer satisfaction is our priority. Any service concerns should be reported within 24 hours for prompt resolution.",
                        options: ["24-hour reporting", "48-hour reporting", "Weekly follow-up"],
                        default: "24-hour reporting"
                    }
                ]
            },
            serviceAreas: [{
                zip: "75001",
                city: "Dallas",
                state: "TX",
                branch: "Dallas North Branch",
                territory: "North Dallas",
                inService: true
            }]
        };
    }

    organizePolicies(policiesArray) {
        // Organize flat policy array into grouped structure
        const organized = {};
        
        policiesArray.forEach(policy => {
            const category = policy.category || 'General';
            if (!organized[category]) {
                organized[category] = [];
            }
            organized[category].push(policy);
        });
        
        return organized;
    }

    getClientIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('clientId') || urlParams.get('id') || 'default';
    }

    populateClientData() {
        // Update header
        document.getElementById('companyName').textContent = this.clientData.companyName;
        document.getElementById('locationInfo').textContent = this.clientData.location;

        // Update sticky header
        document.getElementById('stickyCompanyName').textContent = this.clientData.companyName;

        // Show alert banner if there are alerts
        this.showAlertBanner();

        // Update current time for client's timezone
        this.updateCurrentTime(this.clientData.timezone);

        // Load weather forecast
        this.loadWeatherForecast(this.clientData.location);

        // Update links
        this.updateLinks();

        // Populate sections
        this.populateServices();
        this.populateTechnicians();
        this.populatePolicies();
        this.populateServiceAreas();

        // Populate info cards
        this.populateInfoCards();

        // Show services section by default
        this.showSection('services');
    }

    updateLinks() {
        // Update website link
        if (this.clientData.officeInfo.website) {
            document.getElementById('websiteLink').href = this.clientData.officeInfo.website;
            document.getElementById('stickyWebsiteLink').href = this.clientData.officeInfo.website;
        }

        // Handle FieldRoutes button configuration
        const fieldRoutesBtn = document.getElementById('fieldRoutesLink');
        const stickyFieldRoutesBtn = document.getElementById('stickyFieldRoutesLink');

        if (this.clientData.fieldRoutesButton && this.clientData.fieldRoutesButton.show) {
            // Update button text
            fieldRoutesBtn.textContent = this.clientData.fieldRoutesButton.text;
            stickyFieldRoutesBtn.textContent = this.clientData.fieldRoutesButton.text === 'FieldRoutes' ? 'Routes' : this.clientData.fieldRoutesButton.text;
            
            // Update button URL
            fieldRoutesBtn.href = this.clientData.fieldRoutesButton.url;
            stickyFieldRoutesBtn.href = this.clientData.fieldRoutesButton.url;
            
            // Show buttons
            fieldRoutesBtn.style.display = 'inline-block';
            stickyFieldRoutesBtn.style.display = 'inline-block';
        } else {
            // Hide buttons if not configured
            fieldRoutesBtn.style.display = 'none';
            stickyFieldRoutesBtn.style.display = 'none';
        }
    }

    showAlertBanner() {
        console.log('🔍 showAlertBanner called');
        console.log('🔍 clientData.alerts value:', this.clientData.alerts);
        console.log('🔍 clientData keys:', Object.keys(this.clientData));
        
        const alertBanner = document.getElementById('alertBanner');
        const alertText = document.getElementById('alertText');
        
        console.log('🔍 alertBanner element:', alertBanner);
        console.log('🔍 alertText element:', alertText);
        
        // Check if there's alert text in the client data
        if (this.clientData.alerts && this.clientData.alerts.trim() !== '') {
            // Set the alert text
            alertText.textContent = this.clientData.alerts;
            
            // Show the alert banner
            alertBanner.style.display = 'block';
            
            console.log('🚨 Alert banner displayed:', this.clientData.alerts);
        } else {
            // Hide the alert banner if no alerts
            alertBanner.style.display = 'none';
            console.log('❌ No alerts to display');
        }
    }

    populateInfoCards() {
        const bulletinText = this.clientData.bulletin || 'No bulletin information available.';
        const pestsText = this.clientData.pestsNotCovered || 'No pest exclusions listed.';
        
        document.getElementById('topBulletinContent').textContent = bulletinText;
        document.getElementById('topPestsNotCoveredContent').textContent = pestsText;
    }

    async loadWeatherForecast(location) {
        try {
            // Get coordinates from location
            const coords = await this.geocodeLocation(location);
            if (!coords) throw new Error('Location not found');

            // Fetch weather data
            const weatherResponse = await fetch(
                `${CONFIG.WEATHER.BASE_URL}?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7&temperature_unit=fahrenheit`
            );
            
            if (!weatherResponse.ok) throw new Error('Weather API error');
            
            const weatherData = await weatherResponse.json();
            this.displayWeatherForecast(weatherData.daily);
            
        } catch (error) {
            console.error('Weather loading error:', error);
            document.getElementById('weatherContent').innerHTML = '<div style="color: #ef4444;">Weather unavailable</div>';
        }
    }

    async geocodeLocation(location) {
        try {
            const response = await fetch(
                `${CONFIG.WEATHER.GEOCODING_URL}?q=${encodeURIComponent(location)}&format=json&limit=1`
            );
            
            if (!response.ok) throw new Error('Geocoding failed');
            
            const data = await response.json();
            if (data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
            }
            
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    }

    displayWeatherForecast(dailyData) {
        const weatherContent = document.getElementById('weatherContent');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let forecastHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayName = days[date.getDay()];
            const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
            const weatherDesc = this.getWeatherDescription(dailyData.weather_code[i]);
            
            forecastHTML += `
                <div class="weather-day">
                    <div class="weather-day-name">${dayName}</div>
                    <div class="weather-desc">${weatherDesc}</div>
                    <div class="weather-temp">${maxTemp}°</div>
                </div>
            `;
        }
        
        weatherContent.innerHTML = forecastHTML;
        
        // Update sticky header with today's weather
        const todayTemp = Math.round(dailyData.temperature_2m_max[0]);
        const todayDesc = this.getWeatherDescription(dailyData.weather_code[0]);
        this.updateStickyWeather(`${todayDesc} ${todayTemp}°F`);
    }

    getWeatherDescription(code) {
        const weatherCodes = {
            0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌦️',
            61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 73: '🌨️', 75: '🌨️',
            95: '⛈️'
        };
        return weatherCodes[code] || '🌤️';
    }

    updateCurrentTime(timezone) {
        const timeZoneMap = {
            'Pacific': 'America/Los_Angeles',
            'Mountain': 'America/Denver', 
            'Central': 'America/Chicago',
            'Eastern': 'America/New_York'
        };

        const timeZone = timeZoneMap[timezone] || 'America/Chicago';

        const updateTime = () => {
            const now = new Date();
            const localTime = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: timeZone
            });

            document.getElementById('currentTime').textContent = localTime;
            document.getElementById('stickyTime').textContent = localTime;
        };

        updateTime();
        setInterval(updateTime, 60000); // Update every minute
    }

    updateStickyWeather(weatherText) {
        document.getElementById('stickyWeather').textContent = weatherText;
    }

    populateServices() {
        const servicesGrid = document.getElementById('servicesGrid');
        
        if (!this.clientData.services || this.clientData.services.length === 0) {
            servicesGrid.innerHTML = '<div class="info-section"><div class="info-content">No services available.</div></div>';
            return;
        }

        servicesGrid.innerHTML = '';
        this.clientData.services.forEach(service => {
            const serviceCard = this.createServiceCard(service);
            servicesGrid.appendChild(serviceCard);
        });
    }

    createServiceCard(service) {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        
        // Generate unique ID for this service's calculator
        const serviceId = `service_${Math.random().toString(36).substr(2, 9)}`;
        serviceCard.setAttribute('data-service-id', serviceId);

        // Check if this service has subservices
        if (service.subServices && service.subServices.length > 0) {
            // Service with subservices
            serviceCard.innerHTML = `
                <div class="service-header">
                    <div class="service-name">${service.name || 'Unnamed Service'}</div>
                    <div class="service-frequency">Multiple Options</div>
                </div>
                <div class="service-description">${service.description || 'No description available.'}</div>

                ${service.agentNote ? `
                <!-- Agent Note for Main Service -->
                <div class="agent-note">
                    <div class="agent-note-title">Agent Note</div>
                    <div class="agent-note-content">${service.agentNote}</div>
                </div>
                ` : ''}

                <!-- Service Details -->
                <div class="service-details">
                    <div class="service-details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Contract</div>
                            <div class="detail-value">${service.contract || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Guarantee</div>
                            <div class="detail-value">${service.guarantee || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Duration</div>
                            <div class="detail-value">${service.duration || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Service Type</div>
                            <div class="detail-value">${service.serviceType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Product Type</div>
                            <div class="detail-value">${service.productType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Billing Frequency</div>
                            <div class="detail-value">${service.billingFrequency || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <!-- Subservices -->
                <div class="subservices-container">
                    ${service.subServices.map((subService, index) => {
                        const subServiceId = `${serviceId}_sub_${index}`;
                        return `
                            <div class="subservice-item">
                                <div class="subservice-header">
                                    <div class="subservice-name">${subService.name}</div>
                                    <div class="subservice-frequency">${subService.frequency}</div>
                                </div>
                                <div class="subservice-description">${subService.description}</div>

                                ${subService.agentNote ? `
                                <!-- Agent Note for Subservice -->
                                <div class="agent-note">
                                    <div class="agent-note-title">Agent Note</div>
                                    <div class="agent-note-content">${subService.agentNote}</div>
                                </div>
                                ` : ''}

                                <div class="subservice-pests">
                                    <div class="subservice-pests-title">Pests Covered</div>
                                    <div class="subservice-pests-list pests-covered">${subService.pests}</div>
                                </div>

                                <!-- Subservice Details -->
                                <div class="subservice-details">
                                    <div class="subservice-details-grid">
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Contract</div>
                                            <div class="subservice-detail-value">${subService.contract || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Guarantee</div>
                                            <div class="subservice-detail-value">${subService.guarantee || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Duration</div>
                                            <div class="subservice-detail-value">${subService.duration || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Service Type</div>
                                            <div class="subservice-detail-value">${subService.serviceType || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Product Type</div>
                                            <div class="subservice-detail-value">${subService.productType || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Billing Frequency</div>
                                            <div class="subservice-detail-value">${subService.billingFrequency || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Pricing Calculator for Subservice -->
                                <div class="pricing-calculator">
                                    <div class="calculator-title">
                                        🧮 ${subService.name} Pricing Calculator
                                    </div>
                                    <div class="sqft-input-container">
                                        <input type="number" class="sqft-input" id="sqft_${subServiceId}" placeholder="Enter square footage" min="0" step="1">
                                        <button class="calculate-btn" onclick="calculateSubServicePricing('${subServiceId}', ${index})">Calculate</button>
                                    </div>
                                    <div class="pricing-result" id="result_${subServiceId}">
                                        <div class="pricing-display" id="pricing_${subServiceId}">
                                            <!-- Calculated pricing will appear here -->
                                        </div>
                                        <div class="sqft-range-info" id="range_${subServiceId}">
                                            <!-- Square footage range info will appear here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            // Store subservices pricing data on the element
            serviceCard._subServicesData = service.subServices || [];
        } else {
            // Regular service without subservices
            serviceCard.innerHTML = `
                <div class="service-header">
                    <div class="service-name">${service.name || 'Unnamed Service'}</div>
                    <div class="service-frequency">${service.frequency || 'N/A'}</div>
                </div>
                <div class="service-description">${service.description || 'No description available.'}</div>

                ${service.agentNote ? `
                <!-- Agent Note -->
                <div class="agent-note">
                    <div class="agent-note-title">Agent Note</div>
                    <div class="agent-note-content">${service.agentNote}</div>
                </div>
                ` : ''}

                <!-- Pests Covered Section -->
                <div class="pests-covered-section">
                    <div class="pests-covered-title">Pests Covered</div>
                    <div class="pests-covered-list pests-covered">${service.pests || 'N/A'}</div>
                </div>

                <!-- Service Details -->
                <div class="service-details">
                    <div class="service-details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Contract</div>
                            <div class="detail-value">${service.contract || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Guarantee</div>
                            <div class="detail-value">${service.guarantee || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Duration</div>
                            <div class="detail-value">${service.duration || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Service Type</div>
                            <div class="detail-value">${service.serviceType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Product Type</div>
                            <div class="detail-value">${service.productType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Billing Frequency</div>
                            <div class="detail-value">${service.billingFrequency || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <!-- Pricing Calculator -->
                <div class="pricing-calculator">
                    <div class="calculator-title">
                        ${service.isBundle || service.bundleComponents ? '📦 Bundle Pricing' : '🧮 Pricing Calculator'}
                    </div>
                    
                    ${service.isBundle || service.bundleComponents ? `
                        <!-- Bundle Pricing Display -->
                        <div class="bundle-pricing-container">
                            <div class="bundle-components-list">
                                ${(service.bundleComponents || []).map(component => `
                                    <div class="bundle-component-item">
                                        <div class="bundle-component-name">
                                            <strong>${component.name}</strong>
                                            ${component.frequency ? `<span class="component-frequency">${component.frequency}</span>` : ''}
                                        </div>
                                        <div class="bundle-component-pricing">
                                            <div class="component-price-item">
                                                <span class="price-label">First:</span>
                                                <span class="price-value">${component.firstPrice || 'N/A'}</span>
                                            </div>
                                            <div class="component-price-item">
                                                <span class="price-label">Recurring:</span>
                                                <span class="price-value">${component.recurringPrice || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="bundle-total-pricing">
                                <div class="bundle-total-label">
                                    <strong>Total ${service.bundleLabel || service.name}</strong>
                                </div>
                                <div class="bundle-total-prices">
                                    <div class="bundle-total-item">
                                        <span class="total-label">First Service:</span>
                                        <span class="total-value">${service.bundleTotalFirst || service.firstPrice || 'Contact for pricing'}</span>
                                    </div>
                                    <div class="bundle-total-item">
                                        <span class="total-label">Recurring:</span>
                                        <span class="total-value">${service.bundleTotalRecurring || service.recurringPrice || 'Contact for pricing'}</span>
                                    </div>
                                </div>
                            </div>
                            ${service.billingFrequency ? `
                                <div class="bundle-billing-info">
                                    Billed ${service.billingFrequency}
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <!-- Standard Square Footage Calculator -->
                        <div class="sqft-input-container">
                            <input type="number" class="sqft-input" id="sqft_${serviceId}" placeholder="Enter square footage" min="0" step="1">
                            <button class="calculate-btn" onclick="calculatePricing('${serviceId}')">Calculate</button>
                        </div>
                        <div class="pricing-result" id="result_${serviceId}">
                            <div class="pricing-display" id="pricing_${serviceId}">
                                <!-- Calculated pricing will appear here -->
                            </div>
                            <div class="sqft-range-info" id="range_${serviceId}">
                                <!-- Square footage range info will appear here -->
                            </div>
                        </div>
                    `}
                </div>
            `;

            // Store pricing data on the element for the calculator
            serviceCard._pricingData = service.pricingTiers || [];
            serviceCard._serviceData = service;
        }

        return serviceCard;
    }

    populateTechnicians() {
        const techniciansGrid = document.getElementById('techniciansGrid');
        
        if (!this.clientData.technicians || this.clientData.technicians.length === 0) {
            techniciansGrid.innerHTML = '<div class="info-section"><div class="info-content">No technician information available.</div></div>';
            return;
        }

        this.populateSchedulingPolicies();
        
        techniciansGrid.innerHTML = '';
        this.clientData.technicians.forEach(tech => {
            const techCard = this.createTechnicianCard(tech);
            techniciansGrid.appendChild(techCard);
        });
    }

    createTechnicianCard(tech) {
        const techCard = document.createElement('div');
        techCard.className = 'tech-card';
        
        let roleBadgeClass = 'technician';
        if (tech.role === 'Inspector') roleBadgeClass = 'inspector';
        if (tech.role === 'Both') roleBadgeClass = 'both';

        const zipCodeDisplay = tech.zipCodes && tech.zipCodes.length > 0 ? 
            `<div class="zip-coverage-list">
                ${tech.zipCodes.map(zip => `<span class="zip-badge">${zip}</span>`).join('')}
            </div>` : '';

        techCard.innerHTML = `
            <div class="tech-header">
                <div>
                    <h3 class="tech-name">${tech.name || 'Unknown Technician'}</h3>
                    <div class="tech-company">${tech.company || 'Unknown Company'}</div>
                </div>
                <span class="tech-role-badge ${roleBadgeClass}">${tech.role || 'Technician'}</span>
            </div>
            <div class="tech-details">
                <div class="tech-detail">
                    <div class="tech-detail-label">Max Stops</div>
                    <div class="tech-detail-value">${tech.maxStops || 'Not specified'}</div>
                </div>
                <div class="tech-detail">
                    <div class="tech-detail-label">Phone</div>
                    <div class="tech-detail-value">${tech.phone || 'Not provided'}</div>
                </div>
            </div>
            <div class="tech-schedule">
                <div class="tech-schedule-title">🕐 Schedule</div>
                <div class="tech-schedule-value">${tech.schedule || 'Schedule not specified'}</div>
            </div>
            ${tech.doesNotService ? `
                <div class="tech-restrictions">
                    <div class="tech-restrictions-title">🚫 Does NOT Service</div>
                    <div class="tech-restrictions-value">${tech.doesNotService}</div>
                </div>
            ` : ''}
            ${tech.additionalNotes ? `
                <div class="tech-notes">
                    <div class="tech-notes-title">📝 Additional Notes</div>
                    <div class="tech-notes-value">${tech.additionalNotes}</div>
                </div>
            ` : ''}
            ${zipCodeDisplay}
        `;

        return techCard;
    }

    populateSchedulingPolicies() {
        const policies = this.clientData.policies || {};
        const schedulingOps = policies['Scheduling and Operations'] || [];
        const servicePolicies = policies['Service Policies'] || [];

        // Find specific policies
        const schedulingTimes = schedulingOps.find(p => p.type === 'scheduling_times');
        const maxDistance = schedulingOps.find(p => p.type === 'distance');
        const sameDay = schedulingOps.find(p => p.type === 'sameday');
        const confirmations = schedulingOps.find(p => p.type === 'confirmations');
        const reservices = servicePolicies.find(p => p.type === 'reservices');

        // Update quick reference
        document.getElementById('defaultSchedulingTimes').textContent = 
            schedulingTimes ? schedulingTimes.default : 'Not specified';
        document.getElementById('maxDistance').textContent = 
            maxDistance ? maxDistance.default : 'Not specified';
        document.getElementById('sameDayPolicy').textContent = 
            sameDay ? sameDay.default : 'Not specified';
        document.getElementById('confirmationPolicy').textContent = 
            confirmations ? confirmations.default : 'Not specified';

        // Update service policies
        document.getElementById('reservicesPolicy').textContent = 
            reservices ? reservices.default : 'Not specified';
        document.getElementById('reservicesServiceType').textContent = 'Reservice';
        document.getElementById('reservicesSubscription').textContent = 'Stand-Alone Service (Billing: $0.00)';
    }

    populatePolicies() {
        const policiesGrid = document.getElementById('policiesGrid');
        
        if (!this.clientData.policies) {
            policiesGrid.innerHTML = '<div class="info-section"><div class="info-content">No policy information available.</div></div>';
            return;
        }

        // Create comprehensive policy display with organized categories
        const policyCategories = this.organizePolicies(this.clientData.policies);
        
        if (Object.keys(policyCategories).length === 0) {
            policiesGrid.innerHTML = '<div class="info-section"><div class="info-content">No policy information available.</div></div>';
            return;
        }

        // Create organized policies layout
        policiesGrid.innerHTML = `
            <div class="policies-container">
                <div class="policies-sidebar">
                    ${Object.keys(policyCategories).map(categoryName => `
                        <button class="policy-group-btn" onclick="app.showPolicyGroup('${categoryName}')" id="btn-${categoryName.replace(/\s+/g, '-').toLowerCase()}">
                            ${this.getPolicyIcon(categoryName)} ${categoryName}
                        </button>
                    `).join('')}
                </div>
                <div class="policies-main">
                    ${Object.entries(policyCategories).map(([categoryName, policies]) => `
                        <div class="policy-group-content" id="content-${categoryName.replace(/\s+/g, '-').toLowerCase()}">
                            <div class="policy-group-title">
                                ${this.getPolicyIcon(categoryName)} ${categoryName}
                            </div>
                            <div class="policy-items-grid">
                                ${policies.map(policy => `
                                    <div class="policy-item ${policy.value ? 'has-value' : 'no-value'}">
                                        <div class="policy-item-header">
                                            <div class="policy-item-title">${policy.title}</div>
                                            ${policy.value ? `<div class="policy-status-badge active">Set</div>` : `<div class="policy-status-badge inactive">Not Set</div>`}
                                        </div>
                                        <div class="policy-item-value">
                                            ${policy.value || 'Not specified'}
                                        </div>
                                        ${policy.description ? `<div class="policy-item-description">${policy.description}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Show first group by default
        const firstCategory = Object.keys(policyCategories)[0];
        if (firstCategory) {
            this.showPolicyGroup(firstCategory);
        }
    }

    showPolicyGroup(groupName) {
        // Remove active class from all buttons and content
        document.querySelectorAll('.policy-group-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.policy-group-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected button and content
        const btnId = 'btn-' + groupName.replace(/\s+/g, '-').toLowerCase();
        const contentId = 'content-' + groupName.replace(/\s+/g, '-').toLowerCase();
        
        const btn = document.getElementById(btnId);
        const content = document.getElementById(contentId);
        
        if (btn) btn.classList.add('active');
        if (content) content.classList.add('active');
    }

    populateServiceAreas() {
        const serviceAreasGrid = document.getElementById('serviceAreasGrid');
        
        if (!this.clientData.serviceAreas || this.clientData.serviceAreas.length === 0) {
            serviceAreasGrid.innerHTML = '<div class="info-section"><div class="info-content">No service area information available.</div></div>';
            return;
        }

        // Group by branch
        const groupedAreas = this.clientData.serviceAreas.reduce((groups, area) => {
            const branch = area.branch || 'Unknown Branch';
            if (!groups[branch]) groups[branch] = [];
            groups[branch].push(area);
            return groups;
        }, {});

        serviceAreasGrid.innerHTML = '';
        Object.entries(groupedAreas).forEach(([branch, areas]) => {
            const branchCard = document.createElement('div');
            branchCard.className = 'service-card';
            branchCard.innerHTML = `
                <div class="service-name">${branch}</div>
                <div class="service-pricing" style="grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));">
                    ${areas.map(area => `
                        <div class="price-item">
                            <div class="price-label">${area.zip}</div>
                            <div class="price-value" style="color: ${area.inService ? '#10b981' : '#ef4444'}">
                                ${area.city}, ${area.state}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            serviceAreasGrid.appendChild(branchCard);
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show target section
        const section = document.getElementById(sectionName + 'Section');
        if (section) {
            section.classList.add('active');
        }

        // Set active nav button
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(sectionName.toLowerCase())) {
                btn.classList.add('active');
            }
        });
    }

    showError(message) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('errorState').innerHTML = `<div>Error: ${message}</div>`;
    }

    initializeEventListeners() {
        // Search functionality
        document.getElementById('pestSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchPests();
            }
        });

        // Real-time search on input changes
        document.getElementById('pestSearch').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            if (searchTerm) {
                this.searchPests();
            } else {
                this.clearSearch();
            }
        });

        // Modal close on outside click
        window.onclick = (event) => {
            const modal = document.getElementById('officeModal');
            if (event.target === modal) {
                this.closeOfficeModal();
            }
        };
    }

    initializeStickyHeader() {
        const stickyHeader = document.getElementById('stickyHeader');
        const header = document.querySelector('.header');
        const navSidebar = document.querySelector('.nav-sidebar');
        const toolsSidebar = document.querySelector('.tools-sidebar');

        if (!stickyHeader || !header) {
            setTimeout(() => this.initializeStickyHeader(), 200);
            return;
        }

        let headerHeight = header.offsetHeight;
        let isTransitioning = false;
        let ticking = false;

        const stickyHeaderScrollHandler = () => {
            if (!ticking && !isTransitioning) {
                requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const showThreshold = headerHeight + 50;
                    const hideThreshold = headerHeight + 20;
                    const isHeaderVisible = stickyHeader.classList.contains('show');

                    if (!isHeaderVisible && scrollTop > showThreshold) {
                        isTransitioning = true;
                        stickyHeader.classList.add('show');
                        if (navSidebar) navSidebar.classList.add('sticky-header-active');
                        if (toolsSidebar) toolsSidebar.classList.add('sticky-header-active');
                        setTimeout(() => { isTransitioning = false; }, 300);
                    } else if (isHeaderVisible && scrollTop < hideThreshold) {
                        isTransitioning = true;
                        stickyHeader.classList.remove('show');
                        if (navSidebar) navSidebar.classList.remove('sticky-header-active');
                        if (toolsSidebar) toolsSidebar.classList.remove('sticky-header-active');
                        setTimeout(() => { isTransitioning = false; }, 300);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', stickyHeaderScrollHandler, { passive: true });
    }

    // Search functionality
    searchPests() {
        const searchTerm = document.getElementById('pestSearch').value.toLowerCase().trim();
        if (!searchTerm) return;

        const searchResults = document.getElementById('searchResults');
        const pestsAlert = document.getElementById('pestsNotCoveredAlert');
        const alertContent = document.getElementById('alertContent');

        let foundInServices = [];
        let foundInNotCovered = false;

        // Search in services
        this.clientData.services.forEach(service => {
            // Check main service pests
            if (service.pests && service.pests.toLowerCase().includes(searchTerm)) {
                foundInServices.push({
                    name: service.name,
                    type: 'main'
                });
            }
            // Check subservice pests
            if (service.subServices) {
                service.subServices.forEach(subService => {
                    if (subService.pests && subService.pests.toLowerCase().includes(searchTerm)) {
                        foundInServices.push({
                            name: `${service.name} (${subService.name})`,
                            type: 'sub'
                        });
                    }
                });
            }
        });

        // Check pests not covered
        if (this.clientData.pestsNotCovered && this.clientData.pestsNotCovered.toLowerCase().includes(searchTerm)) {
            foundInNotCovered = true;
        }

        // Update search results
        if (foundInNotCovered) {
            pestsAlert.classList.add('show');
            alertContent.textContent = `"${searchTerm}" appears in the pests not covered list: ${this.clientData.pestsNotCovered}`;
            searchResults.innerHTML = `⚠️ Found "${searchTerm}" in <strong>Pests Not Covered</strong>`;
        } else if (foundInServices.length > 0) {
            pestsAlert.classList.remove('show');
            const serviceLinks = foundInServices.map(service => 
                `<div class="search-result-item" onclick="app.navigateToService('${service.name}', '${searchTerm}')" style="cursor: pointer; color: #60a5fa; text-decoration: underline; padding: 0.5rem 0.75rem; border-bottom: 1px solid #334155; margin-bottom: 0.5rem; display: block; width: 100%; background: rgba(30, 41, 59, 0.5); border-radius: 0.25rem; transition: background 0.2s ease;" onmouseover="this.style.background='rgba(59, 130, 246, 0.2)'" onmouseout="this.style.background='rgba(30, 41, 59, 0.5)'">• ${service.name}</div>`
            ).join('');
            searchResults.innerHTML = `<div style="margin-bottom: 0.75rem; font-weight: 600;">✅ Found "${searchTerm}" in:</div><div style="display: flex; flex-direction: column; gap: 0.25rem;">${serviceLinks}</div>`;
        } else {
            pestsAlert.classList.remove('show');
            searchResults.innerHTML = `❓ No specific coverage found for "${searchTerm}". Check with service details or contact office.`;
        }
    }

    navigateToService(serviceName, searchTerm) {
        // Switch to services section
        this.showSection('services');
        // Filter and highlight the specific service
        this.filterServicesByPest(searchTerm);
        // Scroll to the service (with a small delay to ensure the section is shown)
        setTimeout(() => {
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach(card => {
                const serviceNameElement = card.querySelector('.service-name, .subservice-name');
                if (serviceNameElement && serviceNameElement.textContent.includes(serviceName.split(' (')[0])) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.border = '2px solid #60a5fa';
                    card.style.boxShadow = '0 0 20px rgba(96, 165, 250, 0.4)';
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        card.style.border = '1px solid #475569';
                        card.style.boxShadow = 'none';
                    }, 3000);
                }
            });
        }, 300);
    }

    filterServicesByPest(searchTerm) {
        const servicesGrid = document.getElementById('servicesGrid');
        servicesGrid.innerHTML = '';

        this.clientData.services.forEach(service => {
            let hasMatch = false;

            // Check main service pests
            if (service.pests && service.pests.toLowerCase().includes(searchTerm)) {
                hasMatch = true;
            }

            // Check subservice pests
            if (service.subServices) {
                service.subServices.forEach(subService => {
                    if (subService.pests && subService.pests.toLowerCase().includes(searchTerm)) {
                        hasMatch = true;
                    }
                });
            }

            if (hasMatch) {
                const serviceCard = this.createServiceCard(service);

                // Add highlight to the pest term in main service
                const pestsElement = serviceCard.querySelector('.pests-covered');
                if (pestsElement) {
                    pestsElement.innerHTML = pestsElement.innerHTML.replace(
                        new RegExp(`(${searchTerm})`, 'gi'),
                        '<span class="search-highlight">$1</span>'
                    );
                }

                // Add highlight to the pest term in subservices
                const subServicePests = serviceCard.querySelectorAll('.subservice-pests-list');
                subServicePests.forEach(element => {
                    element.innerHTML = element.innerHTML.replace(
                        new RegExp(`(${searchTerm})`, 'gi'),
                        '<span class="search-highlight">$1</span>'
                    );
                });

                servicesGrid.appendChild(serviceCard);
            }
        });

        // Show services section
        this.showSection('services');
    }

    clearSearch() {
        document.getElementById('pestSearch').value = '';
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('pestsNotCoveredAlert').classList.remove('show');

        // Show all services again
        this.populateServices();
    }

    // Pricing calculation functions
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
            // This is bundle pricing with square footage tiers
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

    calculateSubServicePricing(subServiceId, subServiceIndex) {
        const sqft = parseInt(document.getElementById(`sqft_${subServiceId}`).value);
        const resultDiv = document.getElementById(`result_${subServiceId}`);
        const pricingDiv = document.getElementById(`pricing_${subServiceId}`);
        const rangeDiv = document.getElementById(`range_${subServiceId}`);

        if (!sqft || sqft <= 0) {
            resultDiv.classList.remove('show');
            return;
        }

        // Find the parent service card and get its subservices data
        const serviceCard = document.querySelector(`[data-service-id="${subServiceId.split('_sub_')[0]}"]`);

        if (!serviceCard || !serviceCard._subServicesData || !serviceCard._subServicesData[subServiceIndex]) {
            pricingDiv.innerHTML = '<div class="price-display-item"><div class="price-display-value">No pricing tiers available</div></div>';
            rangeDiv.textContent = '';
            resultDiv.classList.add('show');
            return;
        }

        const subService = serviceCard._subServicesData[subServiceIndex];
        const pricingTiers = subService.pricingTiers || [];

        // Find the appropriate pricing tier
        const tier = pricingTiers.find(t => sqft >= t.sqftMin && sqft <= t.sqftMax);

        if (tier) {
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
        } else {
            pricingDiv.innerHTML = `
                <div class="price-display-item">
                    <div class="price-display-value">No pricing available for ${sqft.toLocaleString()} sq ft</div>
                </div>
            `;
            rangeDiv.textContent = 'Please contact office for custom pricing';
        }

        resultDiv.classList.add('show');
    }

    // Tool functions
    convertAcres() {
        const acres = parseFloat(document.getElementById('acresInput').value);
        const resultDiv = document.getElementById('conversionResult');

        if (isNaN(acres) || acres <= 0) {
            resultDiv.textContent = 'Please enter a valid number';
            resultDiv.style.color = '#ef4444';
            return;
        }

        const sqft = Math.round(acres * 43560);
        resultDiv.textContent = `${sqft.toLocaleString()} sq ft`;
        resultDiv.style.color = '#10b981';
    }

    checkZip() {
        const zip = document.getElementById('zipInput').value.trim();
        const resultDiv = document.getElementById('zipResult');

        if (!/^\d{5}$/.test(zip)) {
            resultDiv.textContent = 'Please enter a valid 5-digit ZIP';
            resultDiv.style.color = '#ef4444';
            return;
        }

        // Check against loaded service areas
        if (this.clientData.serviceAreas && this.clientData.serviceAreas.length > 0) {
            const foundArea = this.clientData.serviceAreas.find(area => area.zip === zip);
            if (foundArea) {
                resultDiv.textContent = `✓ ${foundArea.branch} - ${foundArea.city}, ${foundArea.state}`;
                resultDiv.style.color = foundArea.inService ? '#10b981' : '#ef4444';
            } else {
                resultDiv.textContent = '✗ Not in service area';
                resultDiv.style.color = '#ef4444';
            }
        } else {
            resultDiv.textContent = '✗ Service area data not available';
            resultDiv.style.color = '#ef4444';
        }
    }

    // Technician search functions
    findTechByZip() {
        const zip = document.getElementById('zipLookup').value.trim();
        if (!zip || !/^\d{5}$/.test(zip)) {
            alert('Please enter a valid 5-digit ZIP code');
            return;
        }

        const matchingTechs = this.clientData.technicians.filter(tech => {
            return tech.zipCodes && tech.zipCodes.includes(zip);
        });

        if (matchingTechs.length > 0) {
            this.showSearchResults(`Technicians servicing ZIP ${zip}`, matchingTechs);
        } else {
            this.showSearchResults(`No technicians found for ZIP ${zip}`, []);
        }
    }

    filterByServiceType() {
        const serviceType = document.getElementById('serviceTypeLookup').value;
        if (!serviceType) {
            this.showAllTechs();
            return;
        }

        let matchingTechs = [];
        switch(serviceType) {
            case 'inspection':
                matchingTechs = this.clientData.technicians.filter(tech => 
                    tech.role === 'Inspector' || tech.role === 'Both'
                );
                break;
            case 'technician':
                matchingTechs = this.clientData.technicians.filter(tech => 
                    tech.role === 'Technician' || tech.role === 'Both'
                );
                break;
            case 'both':
                matchingTechs = this.clientData.technicians.filter(tech => 
                    tech.role === 'Both'
                );
                break;
        }

        this.showSearchResults(`${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Results`, matchingTechs);
    }

    showSearchResults(title, techs) {
        const searchResults = document.getElementById('techSearchResults');
        const resultsContent = document.getElementById('searchResultsContent');
        const techniciansGrid = document.getElementById('techniciansGrid');

        techniciansGrid.style.display = 'none';
        searchResults.style.display = 'block';
        searchResults.querySelector('h3').textContent = title;

        if (techs.length === 0) {
            resultsContent.innerHTML = `
                <div class="info-section">
                    <div class="info-content">No technicians found matching your criteria.</div>
                </div>
            `;
        } else {
            resultsContent.innerHTML = '';
            const searchGrid = document.createElement('div');
            searchGrid.className = 'technicians-grid';

            techs.forEach(tech => {
                const techCard = this.createTechnicianCard(tech);
                searchGrid.appendChild(techCard);
            });
            resultsContent.appendChild(searchGrid);
        }
    }

    clearTechSearch() {
        document.getElementById('techSearchResults').style.display = 'none';
        document.getElementById('techniciansGrid').style.display = 'grid';
        document.getElementById('zipLookup').value = '';
        document.getElementById('serviceTypeLookup').value = '';
    }

    showAllTechs() {
        this.clearTechSearch();
    }

    // Toggle functions
    toggleReservicePolicies() {
        const details = document.getElementById('reservicesDetails');
        const toggleText = document.getElementById('toggleText');
        const toggleIcon = document.getElementById('toggleIcon');

        if (details.style.display === 'none') {
            details.style.display = 'flex';
            toggleText.textContent = 'Hide Reservice Details';
            toggleIcon.classList.add('rotated');
        } else {
            details.style.display = 'none';
            toggleText.textContent = 'Show Reservice Details';
            toggleIcon.classList.remove('rotated');
        }
    }

    // Modal functions
    openOfficeModal() {
        const modal = document.getElementById('officeModal');
        const officeInfo = document.getElementById('officeInfo');

        officeInfo.innerHTML = `
            <div class="office-item">
                <span class="office-label">Phone:</span>
                <span class="office-value">${this.clientData.officeInfo.phone || 'Not available'}</span>
            </div>
            <div class="office-item">
                <span class="office-label">Email:</span>
                <span class="office-value">${this.clientData.officeInfo.email || 'Not available'}</span>
            </div>
            <div class="office-item">
                <span class="office-label">Address:</span>
                <span class="office-value">${this.clientData.officeInfo.physicalAddress || 'Not available'}</span>
            </div>
            <div class="office-item">
                <span class="office-label">Hours:</span>
                <span class="office-value">${this.clientData.officeInfo.officeHours || 'Not available'}</span>
            </div>
        `;

        modal.style.display = 'block';
    }

    closeOfficeModal() {
        document.getElementById('officeModal').style.display = 'none';
    }
}

// Global functions for HTML onclick handlers
let app;

function showSection(sectionName) {
    app.showSection(sectionName);
}

function searchPests() {
    app.searchPests();
}

function clearSearch() {
    app.clearSearch();
}

function convertAcres() {
    app.convertAcres();
}

function checkZip() {
    app.checkZip();
}

function findTechByZip() {
    app.findTechByZip();
}

function filterByServiceType() {
    app.filterByServiceType();
}

function showAllTechs() {
    app.showAllTechs();
}

function clearTechSearch() {
    app.clearTechSearch();
}

function toggleReservicePolicies() {
    app.toggleReservicePolicies();
}

function openOfficeModal() {
    app.openOfficeModal();
}

function closeOfficeModal() {
    app.closeOfficeModal();
}

function calculatePricing(serviceId) {
    app.calculatePricing(serviceId);
}

function calculateSubServicePricing(subServiceId, subServiceIndex) {
    app.calculateSubServicePricing(subServiceId, subServiceIndex);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new GitHubProfileViewer();
});

// Initialize sticky header after page is fully loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (app) {
            app.initializeStickyHeader();
        }
    }, 200);
});

// Add Enter key support for pricing calculators
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.classList.contains('sqft-input')) {
        const inputId = e.target.id;
        if (inputId.includes('sqft_')) {
            const serviceId = inputId.replace('sqft_', '');
            if (serviceId.includes('_sub_')) {
                const parts = serviceId.split('_sub_');
                const subServiceIndex = parseInt(parts[1]);
                calculateSubServicePricing(serviceId, subServiceIndex);
            } else {
                calculatePricing(serviceId);
            }
        }
    }
});
        if (!row) return [];
        
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"') {
                // Handle escaped quotes
                if (i + 1 < row.length && row[i + 1] === '"') {
                    current += '"';
                    i++; // Skip the next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        // Add the last field
        result.push(current.trim());
        
        // Clean up the result - remove outer quotes if present
        return result.map(field => {
            field = field.trim();
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.slice(1, -1);
            }
            return field;
        });
    }

    /**
     * Convert Google Sheets data to client data format
     */
    convertGoogleSheetsToClientData(profile) {
        return {
            // Basic Info
            profileId: profile.profileId || '',
            companyName: profile.companyName || '',
            location: profile.location || '',
            phoneNumber: profile.officeInfo?.phone || '',
            contactPerson: profile.contactPerson || '',
            industry: profile.industry || '',
            websiteUrl: profile['Website_URL'] || '',
            
            // Bulletin and Notes
            morningBulletin: profile['Morning_Bulletin'] || '',
            internalNotes: profile['Internal_Notes'] || '',
            
            // Legacy format support
            companyDetails: {
                name: profile['Company_Name'] || '',
                address: profile['Company_Location'] || '',
                phone: profile['Phone_Number'] || '',
                website: profile['Website_URL'] || ''
            },
            
            // Default values for missing data
            services: [],
            technicians: [],
            policies: {},
            serviceAreas: []
        };
    }

    async loadFromWixCMS() {
        // This will be implemented when deployed to Wix
        if (typeof wixData !== 'undefined') {
            const clientId = this.getClientIdFromURL();
            
            try {
                // Query client data from Wix CMS collections
                const client = await wixData.query(CONFIG.WIX.COLLECTIONS.CLIENTS)
                    .eq('_id', clientId)
                    .find();
                
                if (client.items.length > 0) {
                    const clientInfo = client.items[0];
                    
                    // Load related data
                    const [services, technicians, policies, serviceAreas] = await Promise.all([
                        this.loadWixCollection(CONFIG.WIX.COLLECTIONS.SERVICES, 'clientId', clientId),
                        this.loadWixCollection(CONFIG.WIX.COLLECTIONS.TECHNICIANS, 'clientId', clientId),
                        this.loadWixCollection(CONFIG.WIX.COLLECTIONS.POLICIES, 'clientId', clientId),
                        this.loadWixCollection(CONFIG.WIX.COLLECTIONS.SERVICE_AREAS, 'clientId', clientId)
                    ]);

                    return {
                        ...clientInfo,
                        services: services.items,
                        technicians: technicians.items,
                        policies: this.organizePolicies(policies.items),
                        serviceAreas: serviceAreas.items
                    };
                }
            } catch (error) {
                console.error('Error loading from Wix CMS:', error);
                throw error;
            }
        }
        
        throw new Error('Wix environment not available');
    }

    async loadWixCollection(collectionName, filterField, filterValue) {
        return await wixData.query(collectionName)
            .eq(filterField, filterValue)
            .find();
    }

    async loadFromDataSource() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check for profile ID parameter (primary method)
        const profileId = urlParams.get('profileId');
        if (profileId && CONFIG.GOOGLE_SHEETS.WEB_APP_URL) {
            return await this.loadFromGoogleAppsScript(profileId);
        }
        
        // Check if data is passed from Wix or URL parameters
        if (urlParams.has('companyName')) {
            return this.parseURLParams(urlParams);
        }
        
        // Try to load from Google Sheets (legacy method)
        const sheetId = urlParams.get('sheetId');
        if (sheetId && CONFIG.GOOGLE_SHEETS.WEB_APP_URL) {
            return await this.loadFromGoogleSheets(sheetId);
        }
        
        // Fallback to sample data
        return this.loadSampleData();
    }

    async loadFromGoogleAppsScript(profileId) {
        try {
            const apiUrl = `${CONFIG.GOOGLE_SHEETS.WEB_APP_URL}?action=getProfile&profileId=${encodeURIComponent(profileId)}`;
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                Logger.log('Successfully loaded profile from Google Apps Script');
                return result.data;
            } else {
                throw new Error(result.error || 'Invalid response from Google Apps Script');
            }
            
        } catch (error) {
            console.error('Error loading from Google Apps Script:', error);
            
            // Show user-friendly error message
            this.showError(`Failed to load profile data: ${error.message}`);
            
            // Fallback to sample data for development
            return this.loadSampleData();
        }
    }

    parseURLParams(urlParams) {
        const clientData = {
            companyName: urlParams.get('companyName') || 'Unknown Company',
            location: urlParams.get('location') || '',
            timezone: urlParams.get('timezone') || 'Central',
            officeInfo: {
                phone: urlParams.get('phone') || '',
                email: urlParams.get('email') || '',
                website: urlParams.get('website') || '',
                fieldRoutesLink: urlParams.get('fieldRoutesLink') || '',
                physicalAddress: urlParams.get('address') || '',
                officeHours: urlParams.get('hours') || ''
            },
            bulletin: urlParams.get('bulletin') || '',
            pestsNotCovered: urlParams.get('pestsNotCovered') || '',
            services: [],
            technicians: [],
            policies: {},
            serviceAreas: []
        };

        // Parse JSON parameters if provided
        ['services', 'technicians', 'policies', 'serviceAreas'].forEach(param => {
            const value = urlParams.get(param);
            if (value) {
                try {
                    clientData[param] = JSON.parse(decodeURIComponent(value));
                } catch (e) {
                    console.error(`Error parsing ${param}:`, e);
                }
            }
        });

        return clientData;
    }

    async loadFromGoogleSheets(sheetId) {
        try {
            const response = await fetch(`${CONFIG.GOOGLE_SHEETS.WEB_APP_URL}?sheetId=${sheetId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch from Google Sheets');
            }
            
            const data = await response.json();
            return this.formatGoogleSheetsData(data);
        } catch (error) {
            console.error('Error loading from Google Sheets:', error);
            throw error;
        }
    }

    formatGoogleSheetsData(rawData) {
        // Transform Google Sheets data into the expected format
        return {
            companyName: rawData.companyName || 'Unknown Company',
            location: rawData.location || '',
            timezone: rawData.timezone || 'Central',
            officeInfo: rawData.officeInfo || {},
            bulletin: rawData.bulletin || '',
            pestsNotCovered: rawData.pestsNotCovered || '',
            services: rawData.services || [],
            technicians: rawData.technicians || [],
            policies: this.organizePolicies(rawData.policies || []),
            serviceAreas: rawData.serviceAreas || []
        };
    }

    loadSampleData() {
        // Return comprehensive sample data matching original wix-profile-page.html
        return {
            companyName: "SOS Exterminating",
            location: "Dallas, TX",
            timezone: "Central",
            officeInfo: {
                phone: "(214) 555-4567",
                email: "dallas@sosexterminating.com",
                website: "https://sosexterminating.com",
                fieldRoutesLink: "https://fieldroutes.com",
                physicalAddress: "123 Main Street\nDallas, TX 75201",
                officeHours: "Monday-Friday: 8 AM - 5 PM"
            },
            bulletin: "This is test data - no Wix connection detected",
            pestsNotCovered: "Carpenter Ants, Bed Bugs, Termites (requires separate treatment)",
            services: [{
                name: "General Pest Control",
                description: "Comprehensive pest control service with multiple frequency options to meet your specific needs",
                serviceType: "General Pest Control",
                queueExt: "6884",
                productType: "General Pest Control",
                contract: "12 Months",
                guarantee: "90-day guarantee",
                duration: "45 minutes",
                billingFrequency: "After service completion",
                agentNote: "IMPORTANT: Always confirm property square footage before quoting. Ask about previous pest issues to recommend appropriate frequency.",
                subServices: [
                    {
                        name: "Monthly GPC",
                        frequency: "Monthly",
                        description: "Premium monthly pest control for maximum protection year-round",
                        pests: "Ants, Roaches, Spiders, Crickets, Silverfish, Earwigs, Pill Bugs",
                        contract: "12 Months",
                        guarantee: "90-day guarantee",
                        duration: "45-60 minutes",
                        serviceType: "Monthly GPC",
                        productType: "General Pest Control - Monthly",
                        billingFrequency: "Monthly after service",
                        agentNote: "Monthly service recommended for high pest pressure areas or customers with pest phobia. Emphasize year-round protection.",
                        pricingTiers: [
                            { sqftMin: 0, sqftMax: 2500, firstPrice: "$135.00", recurringPrice: "$130.00", serviceType: "Monthly GPC" },
                            { sqftMin: 2501, sqftMax: 3000, firstPrice: "$145.00", recurringPrice: "$140.00", serviceType: "Monthly GPC" },
                            { sqftMin: 3001, sqftMax: 4000, firstPrice: "$155.00", recurringPrice: "$150.00", serviceType: "Monthly GPC" },
                            { sqftMin: 4001, sqftMax: 999999, firstPrice: "Requires Client Follow-Up", recurringPrice: "", serviceType: "Monthly GPC" }
                        ]
                    },
                    {
                        name: "Quarterly GPC",
                        frequency: "Quarterly",
                        description: "Standard quarterly pest control service with seasonal treatments",
                        pests: "Ants, Roaches, Spiders, Crickets, Silverfish",
                        contract: "12 Months",
                        guarantee: "90-day guarantee",
                        duration: "45 minutes",
                        serviceType: "Quarterly GPC",
                        productType: "General Pest Control - Quarterly",
                        billingFrequency: "Quarterly after service",
                        agentNote: "Most popular option. Good for moderate pest pressure. Remind customers about seasonal variations in pest activity.",
                        pricingTiers: [
                            { sqftMin: 0, sqftMax: 2500, firstPrice: "$125.00", recurringPrice: "$120.00", serviceType: "Quarterly GPC" },
                            { sqftMin: 2501, sqftMax: 3000, firstPrice: "$130.00", recurringPrice: "$125.00", serviceType: "Quarterly GPC" },
                            { sqftMin: 3001, sqftMax: 4000, firstPrice: "$140.00", recurringPrice: "$135.00", serviceType: "Quarterly GPC" },
                            { sqftMin: 4001, sqftMax: 999999, firstPrice: "Requires Client Follow-Up", recurringPrice: "", serviceType: "Quarterly GPC" }
                        ]
                    },
                    {
                        name: "Bi-Monthly GPC",
                        frequency: "Bi-Monthly",
                        description: "Enhanced bi-monthly service for moderate to high pest pressure areas",
                        pests: "Ants, Roaches, Spiders, Crickets, Silverfish, Centipedes",
                        contract: "12 Months",
                        guarantee: "90-day guarantee",
                        duration: "45-50 minutes",
                        serviceType: "Bi-Monthly GPC",
                        productType: "General Pest Control - Bi-Monthly",
                        billingFrequency: "Bi-monthly after service",
                        agentNote: "Good middle-ground option. Recommend for customers who want more than quarterly but find monthly excessive.",
                        pricingTiers: [
                            { sqftMin: 0, sqftMax: 2500, firstPrice: "$130.00", recurringPrice: "$125.00", serviceType: "Bi-Monthly GPC" },
                            { sqftMin: 2501, sqftMax: 3000, firstPrice: "$138.00", recurringPrice: "$133.00", serviceType: "Bi-Monthly GPC" },
                            { sqftMin: 3001, sqftMax: 4000, firstPrice: "$148.00", recurringPrice: "$143.00", serviceType: "Bi-Monthly GPC" },
                            { sqftMin: 4001, sqftMax: 999999, firstPrice: "Requires Client Follow-Up", recurringPrice: "", serviceType: "Bi-Monthly GPC" }
                        ]
                    }
                ]
            }, {
                name: "Monthly Mosquito Service",
                description: "Monthly mosquito, flea, and tick control",
                contract: "Seasonal",
                guarantee: "30-day guarantee",
                duration: "30 minutes",
                pests: "Mosquitoes, Fleas, Ticks",
                serviceType: "Monthly Mosquito",
                queueExt: "6884",
                productType: "Mosquito - Flea - Tick",
                frequency: "Monthly",
                billingFrequency: "After service completion",
                agentNote: "Seasonal service typically runs April through October. Emphasize outdoor living enhancement and tick disease prevention.",
                pricingTiers: [
                    { sqftMin: 0, sqftMax: 10890, firstPrice: "$108.00", recurringPrice: "$108.00", serviceType: "Monthly Mosquito" },
                    { sqftMin: 10891, sqftMax: 21780, firstPrice: "$120.00", recurringPrice: "$118.00", serviceType: "Monthly Mosquito" },
                    { sqftMin: 21781, sqftMax: 32680, firstPrice: "$132.00", recurringPrice: "$128.00", serviceType: "Monthly Mosquito" },
                    { sqftMin: 32681, sqftMax: 43560, firstPrice: "$144.00", recurringPrice: "$138.00", serviceType: "Monthly Mosquito" },
                    { sqftMin: 43561, sqftMax: 999999, firstPrice: "Requires Client Follow-Up", recurringPrice: "", serviceType: "Monthly Mosquito" }
                ]
            }],
            technicians: [{
                name: "John Smith",
                company: "SOS Exterminating",
                role: "Both",
                phone: "(214) 555-0001",
                schedule: "Mon-Fri 8-5 Saturday 8-12",
                maxStops: "12",
                doesNotService: "",
                additionalNotes: "Preferred technician for North Dallas area",
                zipCodes: ["75001", "75002", "75010", "75011"]
            }, {
                name: "Sarah Johnson", 
                company: "SOS Exterminating",
                role: "Inspector",
                phone: "(214) 555-0002",
                schedule: "Mon-Fri 9-4",
                maxStops: "8",
                doesNotService: "Does not service regular services – schedule inspections only",
                additionalNotes: "Commercial inspections specialist",
                zipCodes: ["75001", "75002", "75020", "75021"]
            }, {
                name: "Mike Wilson",
                company: "SOS Exterminating", 
                role: "Technician",
                phone: "(214) 555-0003",
                schedule: "Mon-Thur 8-5, Fri 8-3",
                maxStops: "10",
                doesNotService: "Termite, Mosquito/Tick",
                additionalNotes: "Covers weekend emergency calls",
                zipCodes: ["75030", "75031", "75040", "75041"]
            }],
            policies: {
                "Service Coverage": [
                    {
                        type: "vehicles",
                        title: "Do we treat vehicles",
                        description: "Policy regarding pest control services for vehicles and automotive properties.",
                        options: ["Yes", "No", "Case by case"],
                        default: "No"
                    },
                    {
                        type: "commercial",
                        title: "Commercial Properties",
                        description: "Availability of pest control services for commercial and business properties.",
                        options: ["Available", "Not Available", "Limited Service"],
                        default: "Available"
                    },
                    {
                        type: "multifamily",
                        title: "Multi-Family Offered",
                        description: "Pest control services for apartment complexes, condominiums, and multi-unit residential properties.",
                        options: ["Yes", "No", "Property Management Only"],
                        default: "Yes"
                    },
                    {
                        type: "mobile",
                        title: "Trailers/Mobile Homes",
                        description: "Pest control services for mobile homes, trailers, and manufactured housing.",
                        options: ["Yes", "No", "Restrictions Apply"],
                        default: "Yes"
                    }
                ],
                "Scheduling and Operations": [
                    {
                        type: "contract",
                        title: "Signed Contract",
                        description: "Requirements for signed service agreements before beginning pest control services.",
                        options: ["Required", "Not Required", "Verbal Agreement OK"],
                        default: "Required"
                    },
                    {
                        type: "returning",
                        title: "Returning Customers",
                        description: "Special policies and procedures for customers returning after service cancellation.",
                        options: ["Standard Pricing", "Welcome Back Discount", "Re-inspection Required"],
                        default: "Standard Pricing"
                    },
                    {
                        type: "confirmations",
                        title: "Appointment Confirmations",
                        description: "How and when appointment confirmations are sent to customers.",
                        options: ["24 hours prior", "48 hours prior", "Day of service"],
                        default: "24 hours prior"
                    },
                    {
                        type: "callahead",
                        title: "Call Ahead",
                        description: "Policy for technicians calling customers before arriving for service.",
                        options: ["Always call", "Call if requested", "No call policy"],
                        default: "Always call"
                    },
                    {
                        type: "distance",
                        title: "Max Distance",
                        description: "Maximum service distance from branch location for regular service calls.",
                        options: ["25 miles", "50 miles", "75 miles", "No limit"],
                        default: "50 miles"
                    },
                    {
                        type: "scheduling_times",
                        title: "Scheduling Policy Times",
                        description: "Standard time windows and scheduling policies for different service types.",
                        schedulingLayout: {
                            "Inspection": "8:00 AM - 5:00 PM",
                            "Initial/Interior": "8:00 AM - 4:00 PM", 
                            "Regular": "8:00 AM - 5:00 PM"
                        },
                        options: ["Standard Hours", "Extended Hours", "Flexible Schedule"],
                        default: "Standard Hours"
                    },
                    {
                        type: "sameday",
                        title: "Same Day Services",
                        description: "Availability and policies for same-day pest control services.",
                        options: ["Available", "Emergency Only", "Not Available"],
                        default: "Emergency Only"
                    },
                    {
                        type: "techskilling",
                        title: "Tech Skilling",
                        description: "Technician skill level requirements and specialization policies.",
                        options: ["All Techs", "Specialized Techs Only", "Senior Techs Preferred"],
                        default: "All Techs"
                    },
                    {
                        type: "emergency",
                        title: "After Hours Emergency",
                        description: "Emergency pest control services outside of normal business hours.",
                        options: ["Available", "Limited Availability", "Not Available"],
                        default: "Limited Availability"
                    }
                ],
                "Service Policies": [
                    {
                        type: "reservices",
                        title: "Reservices",
                        description: "Policy for repeat service calls within guarantee period due to continued pest activity.",
                        options: ["Free within 30 days", "Free within 60 days", "Free within 90 days"],
                        default: "Must allow 10-14 days for product to work. If customer has had more than 2 reservices on account, attempt to upsell service (QPC to Bi or Bi to Monthly). Exception: may schedule within 2 days of treatment for fleas."
                    },
                    {
                        type: "servicetype",
                        title: "Set Service Type To",
                        description: "Default service type classification for new service agreements.",
                        options: ["Monthly", "Quarterly", "Bi-Monthly", "One-Time"],
                        default: "Quarterly"
                    },
                    {
                        type: "subscription",
                        title: "Set Subscription Type To",
                        description: "Default subscription billing model for ongoing pest control services.",
                        options: ["Contract", "Month-to-Month", "Seasonal"],
                        default: "Contract"
                    }
                ],
                "Payment and Financial": [
                    {
                        type: "plans",
                        title: "Payment Plans",
                        description: "Available payment plan options for pest control services.",
                        options: ["Full Payment", "Split Payment", "Monthly Installments"],
                        default: "Full Payment"
                    },
                    {
                        type: "types",
                        title: "Payment Types",
                        description: "Accepted payment methods for pest control services.",
                        options: ["Cash, Check, Credit Card", "Credit Card Only", "Cash and Check Only"],
                        default: "Cash, Check, Credit Card"
                    },
                    {
                        type: "pastdue",
                        title: "Past Due Period",
                        description: "Grace period before accounts are considered past due and subject to late fees.",
                        options: ["15 days", "30 days", "45 days"],
                        default: "30 days"
                    },
                    {
                        type: "tools",
                        title: "Tools to Save",
                        description: "Available tools and options to help customers save money on pest control services.",
                        options: ["Annual Discounts", "Referral Credits", "Senior Discounts"],
                        default: "Annual Discounts"
                    },
                    {
                        type: "cancellation",
                        title: "Cancellation Policy",
                        description: "Terms and notice requirements for canceling pest control service contracts.",
                        options: ["30 day notice", "60 day notice", "End of contract"],
                        default: "30 day notice"
                    }
                ],
                "Additional Information": [
                    {
                        type: "liability",
                        title: "Liability and Insurance",
                        description: "Company maintains full liability insurance coverage. Customer should report any damages or concerns immediately.",
                        options: ["Full coverage", "Limited coverage", "Customer responsibility"],
                        default: "Full coverage"
                    },
                    {
                        type: "environmental",
                        title: "Environmental Safety",
                        description: "All treatments use EPA-approved products applied according to label instructions. Safety data sheets available upon request.",
                        options: ["Eco-friendly options", "Standard products", "Premium treatments"],
                        default: "Standard products"
                    },
                    {
                        type: "satisfaction",
                        title: "Customer Satisfaction Policy",
                        description: "Customer satisfaction is our priority. Any service concerns should be reported within 24 hours for prompt resolution.",
                        options: ["24-hour reporting", "48-hour reporting", "Weekly follow-up"],
                        default: "24-hour reporting"
                    }
                ]
            },
            serviceAreas: [{
                zip: "75001",
                city: "Dallas",
                state: "TX",
                branch: "Dallas North Branch",
                territory: "North Dallas",
                inService: true
            }]
        };
    }

    organizePolicies(policiesArray) {
        // Organize flat policy array into grouped structure
        const organized = {};
        
        policiesArray.forEach(policy => {
            const category = policy.category || 'General';
            if (!organized[category]) {
                organized[category] = [];
            }
            organized[category].push(policy);
        });
        
        return organized;
    }

    getClientIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('clientId') || urlParams.get('id') || 'default';
    }

    populateClientData() {
        // Update header
        document.getElementById('companyName').textContent = this.clientData.companyName;
        document.getElementById('locationInfo').textContent = this.clientData.location;

        // Update sticky header
        document.getElementById('stickyCompanyName').textContent = this.clientData.companyName;

        // Show alert banner if there are alerts
        this.showAlertBanner();

        // Update current time for client's timezone
        this.updateCurrentTime(this.clientData.timezone);

        // Load weather forecast
        this.loadWeatherForecast(this.clientData.location);

        // Update links
        this.updateLinks();

        // Populate sections
        this.populateServices();
        this.populateTechnicians();
        this.populatePolicies();
        this.populateServiceAreas();

        // Populate info cards
        this.populateInfoCards();

        // Show services section by default
        this.showSection('services');
    }

    updateLinks() {
        // Update website link
        if (this.clientData.officeInfo.website) {
            document.getElementById('websiteLink').href = this.clientData.officeInfo.website;
            document.getElementById('stickyWebsiteLink').href = this.clientData.officeInfo.website;
        }

        // Handle FieldRoutes button configuration
        const fieldRoutesBtn = document.getElementById('fieldRoutesLink');
        const stickyFieldRoutesBtn = document.getElementById('stickyFieldRoutesLink');

        if (this.clientData.fieldRoutesButton && this.clientData.fieldRoutesButton.show) {
            // Update button text
            fieldRoutesBtn.textContent = this.clientData.fieldRoutesButton.text;
            stickyFieldRoutesBtn.textContent = this.clientData.fieldRoutesButton.text === 'FieldRoutes' ? 'Routes' : this.clientData.fieldRoutesButton.text;
            
            // Update button URL
            fieldRoutesBtn.href = this.clientData.fieldRoutesButton.url;
            stickyFieldRoutesBtn.href = this.clientData.fieldRoutesButton.url;
            
            // Show buttons
            fieldRoutesBtn.style.display = 'inline-block';
            stickyFieldRoutesBtn.style.display = 'inline-block';
        } else {
            // Hide buttons if not configured
            fieldRoutesBtn.style.display = 'none';
            stickyFieldRoutesBtn.style.display = 'none';
        }
    }

    showAlertBanner() {
        console.log('🔍 showAlertBanner called');
        console.log('🔍 clientData.alerts value:', this.clientData.alerts);
        console.log('🔍 clientData keys:', Object.keys(this.clientData));
        
        const alertBanner = document.getElementById('alertBanner');
        const alertText = document.getElementById('alertText');
        
        console.log('🔍 alertBanner element:', alertBanner);
        console.log('🔍 alertText element:', alertText);
        
        // Check if there's alert text in the client data
        if (this.clientData.alerts && this.clientData.alerts.trim() !== '') {
            // Set the alert text
            alertText.textContent = this.clientData.alerts;
            
            // Show the alert banner
            alertBanner.style.display = 'block';
            
            console.log('🚨 Alert banner displayed:', this.clientData.alerts);
        } else {
            // Hide the alert banner if no alerts
            alertBanner.style.display = 'none';
            console.log('❌ No alerts to display');
        }
    }

    populateInfoCards() {
        const bulletinText = this.clientData.bulletin || 'No bulletin information available.';
        const pestsText = this.clientData.pestsNotCovered || 'No pest exclusions listed.';
        
        document.getElementById('topBulletinContent').textContent = bulletinText;
        document.getElementById('topPestsNotCoveredContent').textContent = pestsText;
    }

    async loadWeatherForecast(location) {
        try {
            // Get coordinates from location
            const coords = await this.geocodeLocation(location);
            if (!coords) throw new Error('Location not found');

            // Fetch weather data
            const weatherResponse = await fetch(
                `${CONFIG.WEATHER.BASE_URL}?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7&temperature_unit=fahrenheit`
            );
            
            if (!weatherResponse.ok) throw new Error('Weather API error');
            
            const weatherData = await weatherResponse.json();
            this.displayWeatherForecast(weatherData.daily);
            
        } catch (error) {
            console.error('Weather loading error:', error);
            document.getElementById('weatherContent').innerHTML = '<div style="color: #ef4444;">Weather unavailable</div>';
        }
    }

    async geocodeLocation(location) {
        try {
            const response = await fetch(
                `${CONFIG.WEATHER.GEOCODING_URL}?q=${encodeURIComponent(location)}&format=json&limit=1`
            );
            
            if (!response.ok) throw new Error('Geocoding failed');
            
            const data = await response.json();
            if (data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
            }
            
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    }

    displayWeatherForecast(dailyData) {
        const weatherContent = document.getElementById('weatherContent');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let forecastHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dayName = days[date.getDay()];
            const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
            const weatherDesc = this.getWeatherDescription(dailyData.weather_code[i]);
            
            forecastHTML += `
                <div class="weather-day">
                    <div class="weather-day-name">${dayName}</div>
                    <div class="weather-desc">${weatherDesc}</div>
                    <div class="weather-temp">${maxTemp}°</div>
                </div>
            `;
        }
        
        weatherContent.innerHTML = forecastHTML;
        
        // Update sticky header with today's weather
        const todayTemp = Math.round(dailyData.temperature_2m_max[0]);
        const todayDesc = this.getWeatherDescription(dailyData.weather_code[0]);
        this.updateStickyWeather(`${todayDesc} ${todayTemp}°F`);
    }

    getWeatherDescription(code) {
        const weatherCodes = {
            0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌦️',
            61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 73: '🌨️', 75: '🌨️',
            95: '⛈️'
        };
        return weatherCodes[code] || '🌤️';
    }

    updateCurrentTime(timezone) {
        const timeZoneMap = {
            'Pacific': 'America/Los_Angeles',
            'Mountain': 'America/Denver', 
            'Central': 'America/Chicago',
            'Eastern': 'America/New_York'
        };

        const timeZone = timeZoneMap[timezone] || 'America/Chicago';

        const updateTime = () => {
            const now = new Date();
            const localTime = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: timeZone
            });

            document.getElementById('currentTime').textContent = localTime;
            document.getElementById('stickyTime').textContent = localTime;
        };

        updateTime();
        setInterval(updateTime, 60000); // Update every minute
    }

    updateStickyWeather(weatherText) {
        document.getElementById('stickyWeather').textContent = weatherText;
    }

    populateServices() {
        const servicesGrid = document.getElementById('servicesGrid');
        
        if (!this.clientData.services || this.clientData.services.length === 0) {
            servicesGrid.innerHTML = '<div class="info-section"><div class="info-content">No services available.</div></div>';
            return;
        }

        servicesGrid.innerHTML = '';
        this.clientData.services.forEach(service => {
            const serviceCard = this.createServiceCard(service);
            servicesGrid.appendChild(serviceCard);
        });
    }

    createServiceCard(service) {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        
        // Generate unique ID for this service's calculator
        const serviceId = `service_${Math.random().toString(36).substr(2, 9)}`;
        serviceCard.setAttribute('data-service-id', serviceId);

        // Check if this service has subservices
        if (service.subServices && service.subServices.length > 0) {
            // Service with subservices
            serviceCard.innerHTML = `
                <div class="service-header">
                    <div class="service-name">${service.name || 'Unnamed Service'}</div>
                    <div class="service-frequency">Multiple Options</div>
                </div>
                <div class="service-description">${service.description || 'No description available.'}</div>

                ${service.agentNote ? `
                <!-- Agent Note for Main Service -->
                <div class="agent-note">
                    <div class="agent-note-title">Agent Note</div>
                    <div class="agent-note-content">${service.agentNote}</div>
                </div>
                ` : ''}

                <!-- Service Details -->
                <div class="service-details">
                    <div class="service-details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Contract</div>
                            <div class="detail-value">${service.contract || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Guarantee</div>
                            <div class="detail-value">${service.guarantee || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Duration</div>
                            <div class="detail-value">${service.duration || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Service Type</div>
                            <div class="detail-value">${service.serviceType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Product Type</div>
                            <div class="detail-value">${service.productType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Billing Frequency</div>
                            <div class="detail-value">${service.billingFrequency || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <!-- Subservices -->
                <div class="subservices-container">
                    ${service.subServices.map((subService, index) => {
                        const subServiceId = `${serviceId}_sub_${index}`;
                        return `
                            <div class="subservice-item">
                                <div class="subservice-header">
                                    <div class="subservice-name">${subService.name}</div>
                                    <div class="subservice-frequency">${subService.frequency}</div>
                                </div>
                                <div class="subservice-description">${subService.description}</div>

                                ${subService.agentNote ? `
                                <!-- Agent Note for Subservice -->
                                <div class="agent-note">
                                    <div class="agent-note-title">Agent Note</div>
                                    <div class="agent-note-content">${subService.agentNote}</div>
                                </div>
                                ` : ''}

                                <div class="subservice-pests">
                                    <div class="subservice-pests-title">Pests Covered</div>
                                    <div class="subservice-pests-list pests-covered">${subService.pests}</div>
                                </div>

                                <!-- Subservice Details -->
                                <div class="subservice-details">
                                    <div class="subservice-details-grid">
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Contract</div>
                                            <div class="subservice-detail-value">${subService.contract || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Guarantee</div>
                                            <div class="subservice-detail-value">${subService.guarantee || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Duration</div>
                                            <div class="subservice-detail-value">${subService.duration || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Service Type</div>
                                            <div class="subservice-detail-value">${subService.serviceType || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Product Type</div>
                                            <div class="subservice-detail-value">${subService.productType || 'N/A'}</div>
                                        </div>
                                        <div class="subservice-detail-item">
                                            <div class="subservice-detail-label">Billing Frequency</div>
                                            <div class="subservice-detail-value">${subService.billingFrequency || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Pricing Calculator for Subservice -->
                                <div class="pricing-calculator">
                                    <div class="calculator-title">
                                        🧮 ${subService.name} Pricing Calculator
                                    </div>
                                    <div class="sqft-input-container">
                                        <input type="number" class="sqft-input" id="sqft_${subServiceId}" placeholder="Enter square footage" min="0" step="1">
                                        <button class="calculate-btn" onclick="calculateSubServicePricing('${subServiceId}', ${index})">Calculate</button>
                                    </div>
                                    <div class="pricing-result" id="result_${subServiceId}">
                                        <div class="pricing-display" id="pricing_${subServiceId}">
                                            <!-- Calculated pricing will appear here -->
                                        </div>
                                        <div class="sqft-range-info" id="range_${subServiceId}">
                                            <!-- Square footage range info will appear here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            // Store subservices pricing data on the element
            serviceCard._subServicesData = service.subServices || [];
        } else {
            // Regular service without subservices
            serviceCard.innerHTML = `
                <div class="service-header">
                    <div class="service-name">${service.name || 'Unnamed Service'}</div>
                    <div class="service-frequency">${service.frequency || 'N/A'}</div>
                </div>
                <div class="service-description">${service.description || 'No description available.'}</div>

                ${service.agentNote ? `
                <!-- Agent Note -->
                <div class="agent-note">
                    <div class="agent-note-title">Agent Note</div>
                    <div class="agent-note-content">${service.agentNote}</div>
                </div>
                ` : ''}

                <!-- Pests Covered Section -->
                <div class="pests-covered-section">
                    <div class="pests-covered-title">Pests Covered</div>
                    <div class="pests-covered-list pests-covered">${service.pests || 'N/A'}</div>
                </div>

                <!-- Service Details -->
                <div class="service-details">
                    <div class="service-details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Contract</div>
                            <div class="detail-value">${service.contract || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Guarantee</div>
                            <div class="detail-value">${service.guarantee || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Duration</div>
                            <div class="detail-value">${service.duration || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Service Type</div>
                            <div class="detail-value">${service.serviceType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Product Type</div>
                            <div class="detail-value">${service.productType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Billing Frequency</div>
                            <div class="detail-value">${service.billingFrequency || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <!-- Pricing Calculator -->
                <div class="pricing-calculator">
                    <div class="calculator-title">
                        ${service.isBundle || service.bundleComponents ? '📦 Bundle Pricing' : '🧮 Pricing Calculator'}
                    </div>
                    
                    ${service.isBundle || service.bundleComponents ? `
                        <!-- Bundle Pricing Display -->
                        <div class="bundle-pricing-container">
                            <div class="bundle-components-list">
                                ${(service.bundleComponents || []).map(component => `
                                    <div class="bundle-component-item">
                                        <div class="bundle-component-name">
                                            <strong>${component.name}</strong>
                                            ${component.frequency ? `<span class="component-frequency">${component.frequency}</span>` : ''}
                                        </div>
                                        <div class="bundle-component-pricing">
                                            <div class="component-price-item">
                                                <span class="price-label">First:</span>
                                                <span class="price-value">${component.firstPrice || 'N/A'}</span>
                                            </div>
                                            <div class="component-price-item">
                                                <span class="price-label">Recurring:</span>
                                                <span class="price-value">${component.recurringPrice || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="bundle-total-pricing">
                                <div class="bundle-total-label">
                                    <strong>Total ${service.bundleLabel || service.name}</strong>
                                </div>
                                <div class="bundle-total-prices">
                                    <div class="bundle-total-item">
                                        <span class="total-label">First Service:</span>
                                        <span class="total-value">${service.bundleTotalFirst || service.firstPrice || 'Contact for pricing'}</span>
                                    </div>
                                    <div class="bundle-total-item">
                                        <span class="total-label">Recurring:</span>
                                        <span class="total-value">${service.bundleTotalRecurring || service.recurringPrice || 'Contact for pricing'}</span>
                                    </div>
                                </div>
                            </div>
                            ${service.billingFrequency ? `
                                <div class="bundle-billing-info">
                                    Billed ${service.billingFrequency}
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <!-- Standard Square Footage Calculator -->
                        <div class="sqft-input-container">
                            <input type="number" class="sqft-input" id="sqft_${serviceId}" placeholder="Enter square footage" min="0" step="1">
                            <button class="calculate-btn" onclick="calculatePricing('${serviceId}')">Calculate</button>
                        </div>
                        <div class="pricing-result" id="result_${serviceId}">
                            <div class="pricing-display" id="pricing_${serviceId}">
                                <!-- Calculated pricing will appear here -->
                            </div>
                            <div class="sqft-range-info" id="range_${serviceId}">
                                <!-- Square footage range info will appear here -->
                            </div>
                        </div>
                    `}
                </div>
            `;

            // Store pricing data on the element for the calculator
            serviceCard._pricingData = service.pricingTiers || [];
            serviceCard._serviceData = service;
        }

        return serviceCard;
    }

    populateTechnicians() {
        const techniciansGrid = document.getElementById('techniciansGrid');
        
        if (!this.clientData.technicians || this.clientData.technicians.length === 0) {
            techniciansGrid.innerHTML = '<div class="info-section"><div class="info-content">No technician information available.</div></div>';
            return;
        }

        this.populateSchedulingPolicies();
        
        techniciansGrid.innerHTML = '';
        this.clientData.technicians.forEach(tech => {
            const techCard = this.createTechnicianCard(tech);
            techniciansGrid.appendChild(techCard);
        });
    }

    createTechnicianCard(tech) {
        const techCard = document.createElement('div');
        techCard.className = 'tech-card';
        
        let roleBadgeClass = 'technician';
        if (tech.role === 'Inspector') roleBadgeClass = 'inspector';
        if (tech.role === 'Both') roleBadgeClass = 'both';

        const zipCodeDisplay = tech.zipCodes && tech.zipCodes.length > 0 ? 
            `<div class="zip-coverage-list">
                ${tech.zipCodes.map(zip => `<span class="zip-badge">${zip}</span>`).join('')}
            </div>` : '';

        techCard.innerHTML = `
            <div class="tech-header">
                <div>
                    <h3 class="tech-name">${tech.name || 'Unknown Technician'}</h3>
                    <div class="tech-company">${tech.company || 'Unknown Company'}</div>
                </div>
                <span class="tech-role-badge ${roleBadgeClass}">${tech.role || 'Technician'}</span>
            </div>
            <div class="tech-details">
                <div class="tech-detail">
                    <div class="tech-detail-label">Max Stops</div>
                    <div class="tech-detail-value">${tech.maxStops || 'Not specified'}</div>
                </div>
                <div class="tech-detail">
                    <div class="tech-detail-label">Phone</div>
                    <div class="tech-detail-value">${tech.phone || 'Not provided'}</div>
                </div>
            </div>
            <div class="tech-schedule">
                <div class="tech-schedule-title">🕐 Schedule</div>
                <div class="tech-schedule-value">${tech.schedule || 'Schedule not specified'}</div>
            </div>
            ${tech.doesNotService ? `
                <div class="tech-restrictions">
                    <div class="tech-restrictions-title">🚫 Does NOT Service</div>
                    <div class="tech-restrictions-value">${tech.doesNotService}</div>
                </div>
            ` : ''}
            ${tech.additionalNotes ? `
                <div class="tech-notes">
                    <div class="tech-notes-title">📝 Additional Notes</div>
                    <div class="tech-notes-value">${tech.additionalNotes}</div>
                </div>
            ` : ''}
            ${zipCodeDisplay}
        `;

        return techCard;
    }

    populateSchedulingPolicies() {
        const policies = this.clientData.policies || {};
        const schedulingOps = policies['Scheduling and Operations'] || [];
        const servicePolicies = policies['Service Policies'] || [];

        // Find specific policies
        const schedulingTimes = schedulingOps.find(p => p.type === 'scheduling_times');
        const maxDistance = schedulingOps.find(p => p.type === 'distance');
        const sameDay = schedulingOps.find(p => p.type === 'sameday');
        const confirmations = schedulingOps.find(p => p.type === 'confirmations');
        const reservices = servicePolicies.find(p => p.type === 'reservices');

        // Update quick reference
        document.getElementById('defaultSchedulingTimes').textContent = 
            schedulingTimes ? schedulingTimes.default : 'Not specified';
        document.getElementById('maxDistance').textContent = 
            maxDistance ? maxDistance.default : 'Not specified';
        document.getElementById('sameDayPolicy').textContent = 
            sameDay ? sameDay.default : 'Not specified';
        document.getElementById('confirmationPolicy').textContent = 
            confirmations ? confirmations.default : 'Not specified';

        // Update service policies
        document.getElementById('reservicesPolicy').textContent = 
            reservices ? reservices.default : 'Not specified';
        document.getElementById('reservicesServiceType').textContent = 'Reservice';
        document.getElementById('reservicesSubscription').textContent = 'Stand-Alone Service (Billing: $0.00)';
    }

    populatePolicies() {
        const policiesGrid = document.getElementById('policiesGrid');
        
        if (!this.clientData.policies) {
            policiesGrid.innerHTML = '<div class="info-section"><div class="info-content">No policy information available.</div></div>';
            return;
        }

        // Create comprehensive policy display with organized categories
        const policyCategories = this.organizePolicies(this.clientData.policies);
        
        if (Object.keys(policyCategories).length === 0) {
            policiesGrid.innerHTML = '<div class="info-section"><div class="info-content">No policy information available.</div></div>';
            return;
        }

        // Create organized policies layout
        policiesGrid.innerHTML = `
            <div class="policies-container">
                <div class="policies-sidebar">
                    ${Object.keys(policyCategories).map(categoryName => `
                        <button class="policy-group-btn" onclick="app.showPolicyGroup('${categoryName}')" id="btn-${categoryName.replace(/\s+/g, '-').toLowerCase()}">
                            ${this.getPolicyIcon(categoryName)} ${categoryName}
                        </button>
                    `).join('')}
                </div>
                <div class="policies-main">
                    ${Object.entries(policyCategories).map(([categoryName, policies]) => `
                        <div class="policy-group-content" id="content-${categoryName.replace(/\s+/g, '-').toLowerCase()}">
                            <div class="policy-group-title">
                                ${this.getPolicyIcon(categoryName)} ${categoryName}
                            </div>
                            <div class="policy-items-grid">
                                ${policies.map(policy => `
                                    <div class="policy-item ${policy.value ? 'has-value' : 'no-value'}">
                                        <div class="policy-item-header">
                                            <div class="policy-item-title">${policy.title}</div>
                                            ${policy.value ? `<div class="policy-status-badge active">Set</div>` : `<div class="policy-status-badge inactive">Not Set</div>`}
                                        </div>
                                        <div class="policy-item-value">
                                            ${policy.value || 'Not specified'}
                                        </div>
                                        ${policy.description ? `<div class="policy-item-description">${policy.description}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Show first group by default
        const firstCategory = Object.keys(policyCategories)[0];
        if (firstCategory) {
            this.showPolicyGroup(firstCategory);
        }
    }

    showPolicyGroup(groupName) {
        // Remove active class from all buttons and content
        document.querySelectorAll('.policy-group-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.policy-group-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected button and content
        const btnId = 'btn-' + groupName.replace(/\s+/g, '-').toLowerCase();
        const contentId = 'content-' + groupName.replace(/\s+/g, '-').toLowerCase();
        
        const btn = document.getElementById(btnId);
        const content = document.getElementById(contentId);
        
        if (btn) btn.classList.add('active');
        if (content) content.classList.add('active');
    }

    populateServiceAreas() {
        const serviceAreasGrid = document.getElementById('serviceAreasGrid');
        
        if (!this.clientData.serviceAreas || this.clientData.serviceAreas.length === 0) {
            serviceAreasGrid.innerHTML = '<div class="info-section"><div class="info-content">No service area information available.</div></div>';
            return;
        }

        // Group by branch
        const groupedAreas = this.clientData.serviceAreas.reduce((groups, area) => {
            const branch = area.branch || 'Unknown Branch';
            if (!groups[branch]) groups[branch] = [];
            groups[branch].push(area);
            return groups;
        }, {});

        serviceAreasGrid.innerHTML = '';
        Object.entries(groupedAreas).forEach(([branch, areas]) => {
            const branchCard = document.createElement('div');
            branchCard.className = 'service-card';
            branchCard.innerHTML = `
                <div class="service-name">${branch}</div>
                <div class="service-pricing" style="grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));">
                    ${areas.map(area => `
                        <div class="price-item">
                            <div class="price-label">${area.zip}</div>
                            <div class="price-value" style="color: ${area.inService ? '#10b981' : '#ef4444'}">
                                ${area.city}, ${area.state}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            serviceAreasGrid.appendChild(branchCard);
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show target section
        const section = document.getElementById(sectionName + 'Section');
        if (section) {
            section.classList.add('active');
        }

        // Set active nav button
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(sectionName.toLowerCase())) {
                btn.classList.add('active');
            }
        });
    }

    showError(message) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('errorState').innerHTML = `<div>Error: ${message}</div>`;
    }

    initializeEventListeners() {
        // Search functionality
        document.getElementById('pestSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchPests();
            }
        });

        // Real-time search on input changes
        document.getElementById('pestSearch').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            if (searchTerm) {
                this.searchPests();
            } else {
                this.clearSearch();
            }
        });

        // Modal close on outside click
        window.onclick = (event) => {
            const modal = document.getElementById('officeModal');
            if (event.target === modal) {
                this.closeOfficeModal();
            }
        };
    }

    initializeStickyHeader() {
        const stickyHeader = document.getElementById('stickyHeader');
        const header = document.querySelector('.header');
        const navSidebar = document.querySelector('.nav-sidebar');
        const toolsSidebar = document.querySelector('.tools-sidebar');

        if (!stickyHeader || !header) {
            setTimeout(() => this.initializeStickyHeader(), 200);
            return;
        }

        let headerHeight = header.offsetHeight;
        let isTransitioning = false;
        let ticking = false;

        const stickyHeaderScrollHandler = () => {
            if (!ticking && !isTransitioning) {
                requestAnimationFrame(() => {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const showThreshold = headerHeight + 50;
                    const hideThreshold = headerHeight + 20;
                    const isHeaderVisible = stickyHeader.classList.contains('show');

                    if (!isHeaderVisible && scrollTop > showThreshold) {
                        isTransitioning = true;
                        stickyHeader.classList.add('show');
                        if (navSidebar) navSidebar.classList.add('sticky-header-active');
                        if (toolsSidebar) toolsSidebar.classList.add('sticky-header-active');
                        setTimeout(() => { isTransitioning = false; }, 300);
                    } else if (isHeaderVisible && scrollTop < hideThreshold) {
                        isTransitioning = true;
                        stickyHeader.classList.remove('show');
                        if (navSidebar) navSidebar.classList.remove('sticky-header-active');
                        if (toolsSidebar) toolsSidebar.classList.remove('sticky-header-active');
                        setTimeout(() => { isTransitioning = false; }, 300);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', stickyHeaderScrollHandler, { passive: true });
    }

    // Search functionality
    searchPests() {
        const searchTerm = document.getElementById('pestSearch').value.toLowerCase().trim();
        if (!searchTerm) return;

        const searchResults = document.getElementById('searchResults');
        const pestsAlert = document.getElementById('pestsNotCoveredAlert');
        const alertContent = document.getElementById('alertContent');

        let foundInServices = [];
        let foundInNotCovered = false;

        // Search in services
        this.clientData.services.forEach(service => {
            // Check main service pests
            if (service.pests && service.pests.toLowerCase().includes(searchTerm)) {
                foundInServices.push({
                    name: service.name,
                    type: 'main'
                });
            }
            // Check subservice pests
            if (service.subServices) {
                service.subServices.forEach(subService => {
                    if (subService.pests && subService.pests.toLowerCase().includes(searchTerm)) {
                        foundInServices.push({
                            name: `${service.name} (${subService.name})`,
                            type: 'sub'
                        });
                    }
                });
            }
        });

        // Check pests not covered
        if (this.clientData.pestsNotCovered && this.clientData.pestsNotCovered.toLowerCase().includes(searchTerm)) {
            foundInNotCovered = true;
        }

        // Update search results
        if (foundInNotCovered) {
            pestsAlert.classList.add('show');
            alertContent.textContent = `"${searchTerm}" appears in the pests not covered list: ${this.clientData.pestsNotCovered}`;
            searchResults.innerHTML = `⚠️ Found "${searchTerm}" in <strong>Pests Not Covered</strong>`;
        } else if (foundInServices.length > 0) {
            pestsAlert.classList.remove('show');
            const serviceLinks = foundInServices.map(service => 
                `<div class="search-result-item" onclick="app.navigateToService('${service.name}', '${searchTerm}')" style="cursor: pointer; color: #60a5fa; text-decoration: underline; padding: 0.5rem 0.75rem; border-bottom: 1px solid #334155; margin-bottom: 0.5rem; display: block; width: 100%; background: rgba(30, 41, 59, 0.5); border-radius: 0.25rem; transition: background 0.2s ease;" onmouseover="this.style.background='rgba(59, 130, 246, 0.2)'" onmouseout="this.style.background='rgba(30, 41, 59, 0.5)'">• ${service.name}</div>`
            ).join('');
            searchResults.innerHTML = `<div style="margin-bottom: 0.75rem; font-weight: 600;">✅ Found "${searchTerm}" in:</div><div style="display: flex; flex-direction: column; gap: 0.25rem;">${serviceLinks}</div>`;
        } else {
            pestsAlert.classList.remove('show');
            searchResults.innerHTML = `❓ No specific coverage found for "${searchTerm}". Check with service details or contact office.`;
        }
    }

    navigateToService(serviceName, searchTerm) {
        // Switch to services section
        this.showSection('services');
        // Filter and highlight the specific service
        this.filterServicesByPest(searchTerm);
        // Scroll to the service (with a small delay to ensure the section is shown)
        setTimeout(() => {
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach(card => {
                const serviceNameElement = card.querySelector('.service-name, .subservice-name');
                if (serviceNameElement && serviceNameElement.textContent.includes(serviceName.split(' (')[0])) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.border = '2px solid #60a5fa';
                    card.style.boxShadow = '0 0 20px rgba(96, 165, 250, 0.4)';
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        card.style.border = '1px solid #475569';
                        card.style.boxShadow = 'none';
                    }, 3000);
                }
            });
        }, 300);
    }

    filterServicesByPest(searchTerm) {
        const servicesGrid = document.getElementById('servicesGrid');
        servicesGrid.innerHTML = '';

        this.clientData.services.forEach(service => {
            let hasMatch = false;

            // Check main service pests
            if (service.pests && service.pests.toLowerCase().includes(searchTerm)) {
                hasMatch = true;
            }

            // Check subservice pests
            if (service.subServices) {
                service.subServices.forEach(subService => {
                    if (subService.pests && subService.pests.toLowerCase().includes(searchTerm)) {
                        hasMatch = true;
                    }
                });
            }

            if (hasMatch) {
                const serviceCard = this.createServiceCard(service);

                // Add highlight to the pest term in main service
                const pestsElement = serviceCard.querySelector('.pests-covered');
                if (pestsElement) {
                    pestsElement.innerHTML = pestsElement.innerHTML.replace(
                        new RegExp(`(${searchTerm})`, 'gi'),
                        '<span class="search-highlight">$1</span>'
                    );
                }

                // Add highlight to the pest term in subservices
                const subServicePests = serviceCard.querySelectorAll('.subservice-pests-list');
                subServicePests.forEach(element => {
                    element.innerHTML = element.innerHTML.replace(
                        new RegExp(`(${searchTerm})`, 'gi'),
                        '<span class="search-highlight">$1</span>'
                    );
                });

                servicesGrid.appendChild(serviceCard);
            }
        });

        // Show services section
        this.showSection('services');
    }

    clearSearch() {
        document.getElementById('pestSearch').value = '';
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('pestsNotCoveredAlert').classList.remove('show');

        // Show all services again
        this.populateServices();
    }

    // Pricing calculation functions
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
            // This is bundle pricing with square footage tiers
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

    calculateSubServicePricing(subServiceId, subServiceIndex) {
        const sqft = parseInt(document.getElementById(`sqft_${subServiceId}`).value);
        const resultDiv = document.getElementById(`result_${subServiceId}`);
        const pricingDiv = document.getElementById(`pricing_${subServiceId}`);
        const rangeDiv = document.getElementById(`range_${subServiceId}`);

        if (!sqft || sqft <= 0) {
            resultDiv.classList.remove('show');
            return;
        }

        // Find the parent service card and get its subservices data
        const serviceCard = document.querySelector(`[data-service-id="${subServiceId.split('_sub_')[0]}"]`);

        if (!serviceCard || !serviceCard._subServicesData || !serviceCard._subServicesData[subServiceIndex]) {
            pricingDiv.innerHTML = '<div class="price-display-item"><div class="price-display-value">No pricing tiers available</div></div>';
            rangeDiv.textContent = '';
            resultDiv.classList.add('show');
            return;
        }

        const subService = serviceCard._subServicesData[subServiceIndex];
        const pricingTiers = subService.pricingTiers || [];

        // Find the appropriate pricing tier
        const tier = pricingTiers.find(t => sqft >= t.sqftMin && sqft <= t.sqftMax);

        if (tier) {
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
        } else {
            pricingDiv.innerHTML = `
                <div class="price-display-item">
                    <div class="price-display-value">No pricing available for ${sqft.toLocaleString()} sq ft</div>
                </div>
            `;
            rangeDiv.textContent = 'Please contact office for custom pricing';
        }

        resultDiv.classList.add('show');
    }

    // Tool functions
    convertAcres() {
        const acres = parseFloat(document.getElementById('acresInput').value);
        const resultDiv = document.getElementById('conversionResult');

        if (isNaN(acres) || acres <= 0) {
            resultDiv.textContent = 'Please enter a valid number';
            resultDiv.style.color = '#ef4444';
            return;
        }

        const sqft = Math.round(acres * 43560);
        resultDiv.textContent = `${sqft.toLocaleString()} sq ft`;
        resultDiv.style.color = '#10b981';
    }

    checkZip() {
        const zip = document.getElementById('zipInput').value.trim();
        const resultDiv = document.getElementById('zipResult');

        if (!/^\d{5}$/.test(zip)) {
            resultDiv.textContent = 'Please enter a valid 5-digit ZIP';
            resultDiv.style.color = '#ef4444';
            return;
        }

        // Check against loaded service areas
        if (this.clientData.serviceAreas && this.clientData.serviceAreas.length > 0) {
            const foundArea = this.clientData.serviceAreas.find(area => area.zip === zip);
            if (foundArea) {
                resultDiv.textContent = `✓ ${foundArea.branch} - ${foundArea.city}, ${foundArea.state}`;
                resultDiv.style.color = foundArea.inService ? '#10b981' : '#ef4444';
            } else {
                resultDiv.textContent = '✗ Not in service area';
                resultDiv.style.color = '#ef4444';
            }
        } else {
            resultDiv.textContent = '✗ Service area data not available';
            resultDiv.style.color = '#ef4444';
        }
    }

    // Technician search functions
    findTechByZip() {
        const zip = document.getElementById('zipLookup').value.trim();
        if (!zip || !/^\d{5}$/.test(zip)) {
            alert('Please enter a valid 5-digit ZIP code');
            return;
        }

        const matchingTechs = this.clientData.technicians.filter(tech => {
            return tech.zipCodes && tech.zipCodes.includes(zip);
        });

        if (matchingTechs.length > 0) {
            this.showSearchResults(`Technicians servicing ZIP ${zip}`, matchingTechs);
        } else {
            this.showSearchResults(`No technicians found for ZIP ${zip}`, []);
        }
    }

    filterByServiceType() {
        const serviceType = document.getElementById('serviceTypeLookup').value;
        if (!serviceType) {
            this.showAllTechs();
            return;
        }

        let matchingTechs = [];
        switch(serviceType) {
            case 'inspection':
                matchingTechs = this.clientData.technicians.filter(tech => 
                    tech.role === 'Inspector' || tech.role === 'Both'
                );
                break;
            case 'technician':
                matchingTechs = this.clientData.technicians.filter(tech => 
                    tech.role === 'Technician' || tech.role === 'Both'
                );
                break;
            case 'both':
                matchingTechs = this.clientData.technicians.filter(tech => 
                    tech.role === 'Both'
                );
                break;
        }

        this.showSearchResults(`${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Results`, matchingTechs);
    }

    showSearchResults(title, techs) {
        const searchResults = document.getElementById('techSearchResults');
        const resultsContent = document.getElementById('searchResultsContent');
        const techniciansGrid = document.getElementById('techniciansGrid');

        techniciansGrid.style.display = 'none';
        searchResults.style.display = 'block';
        searchResults.querySelector('h3').textContent = title;

        if (techs.length === 0) {
            resultsContent.innerHTML = `
                <div class="info-section">
                    <div class="info-content">No technicians found matching your criteria.</div>
                </div>
            `;
        } else {
            resultsContent.innerHTML = '';
            const searchGrid = document.createElement('div');
            searchGrid.className = 'technicians-grid';

            techs.forEach(tech => {
                const techCard = this.createTechnicianCard(tech);
                searchGrid.appendChild(techCard);
            });
            resultsContent.appendChild(searchGrid);
        }
    }

    clearTechSearch() {
        document.getElementById('techSearchResults').style.display = 'none';
        document.getElementById('techniciansGrid').style.display = 'grid';
        document.getElementById('zipLookup').value = '';
        document.getElementById('serviceTypeLookup').value = '';
    }

    showAllTechs() {
        this.clearTechSearch();
    }

    // Toggle functions
    toggleReservicePolicies() {
        const details = document.getElementById('reservicesDetails');
        const toggleText = document.getElementById('toggleText');
        const toggleIcon = document.getElementById('toggleIcon');

        if (details.style.display === 'none') {
            details.style.display = 'flex';
            toggleText.textContent = 'Hide Reservice Details';
            toggleIcon.classList.add('rotated');
        } else {
            details.style.display = 'none';
            toggleText.textContent = 'Show Reservice Details';
            toggleIcon.classList.remove('rotated');
        }
    }

    // Modal functions
    openOfficeModal() {
        const modal = document.getElementById('officeModal');
        const officeInfo = document.getElementById('officeInfo');

        officeInfo.innerHTML = `
            <div class="office-item">
                <span class="office-label">Phone:</span>
                <span class="office-value">${this.clientData.officeInfo.phone || 'Not available'}</span>
            </div>
            <div class="office-item">
                <span class="office-label">Email:</span>
                <span class="office-value">${this.clientData.officeInfo.email || 'Not available'}</span>
            </div>
            <div class="office-item">
                <span class="office-label">Address:</span>
                <span class="office-value">${this.clientData.officeInfo.physicalAddress || 'Not available'}</span>
            </div>
            <div class="office-item">
                <span class="office-label">Hours:</span>
                <span class="office-value">${this.clientData.officeInfo.officeHours || 'Not available'}</span>
            </div>
        `;

        modal.style.display = 'block';
    }

    closeOfficeModal() {
        document.getElementById('officeModal').style.display = 'none';
    }
}

// Global functions for HTML onclick handlers
let app;

function showSection(sectionName) {
    app.showSection(sectionName);
}

function searchPests() {
    app.searchPests();
}

function clearSearch() {
    app.clearSearch();
}

function convertAcres() {
    app.convertAcres();
}

function checkZip() {
    app.checkZip();
}

function findTechByZip() {
    app.findTechByZip();
}

function filterByServiceType() {
    app.filterByServiceType();
}

function showAllTechs() {
    app.showAllTechs();
}

function clearTechSearch() {
    app.clearTechSearch();
}

function toggleReservicePolicies() {
    app.toggleReservicePolicies();
}

function openOfficeModal() {
    app.openOfficeModal();
}

function closeOfficeModal() {
    app.closeOfficeModal();
}

function calculatePricing(serviceId) {
    app.calculatePricing(serviceId);
}

function calculateSubServicePricing(subServiceId, subServiceIndex) {
    app.calculateSubServicePricing(subServiceId, subServiceIndex);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new GitHubProfileViewer();
});

// Initialize sticky header after page is fully loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (app) {
            app.initializeStickyHeader();
        }
    }, 200);
});

// Add Enter key support for pricing calculators
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.classList.contains('sqft-input')) {
        const inputId = e.target.id;
        if (inputId.includes('sqft_')) {
            const serviceId = inputId.replace('sqft_', '');
            if (serviceId.includes('_sub_')) {
                const parts = serviceId.split('_sub_');
                const subServiceIndex = parseInt(parts[1]);
                calculateSubServicePricing(serviceId, subServiceIndex);
            } else {
                calculatePricing(serviceId);
            }
        }
    }
});
