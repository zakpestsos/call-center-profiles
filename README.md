# Call Center Profile System

A comprehensive client profile management system designed for call centers, integrating Google Sheets data with Wix CMS and featuring real-time weather information, technician scheduling, and service management.

## 🌟 Features

- **Dynamic Client Profiles**: Complete client information with contact details, services, and policies
- **Technician Management**: Advanced filtering and search for technician assignments
- **Service Tracking**: Comprehensive service listings with frequency badges and detailed descriptions
- **Policy Organization**: Categorized policies with toggle functionality
- **Weather Integration**: Real-time 7-day weather forecasts for client locations
- **Responsive Design**: Cyberpunk-themed interface optimized for all devices
- **Multi-Source Data**: Supports both Google Sheets and Wix CMS backends

## 🚀 Quick Start

### For Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/call-center-profiles.git
cd call-center-profiles

# Install development server (optional)
npm install

# Start local server
npm start
# Or open index.html directly in your browser
```

### For Production
See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete integration instructions with Google Sheets and Wix CMS.

## 📁 Project Structure

```
├── index.html              # Main HTML structure
├── styles.css              # Complete styling (cyberpunk theme)
├── app.js                  # Main application logic
├── config.js               # Configuration settings
├── gas-integration.js      # Google Apps Script backend
├── wix-backend.js          # Wix CMS integration
├── package.json            # Project metadata
├── README.md               # This file
└── SETUP_GUIDE.md          # Detailed setup instructions
```

## 🔧 Configuration

The system supports multiple data sources and environments:

### Environment Variables
```javascript
// config.js
const CONFIG = {
  WIX: {
    IS_WIX_ENVIRONMENT: false, // Set to true when deploying to Wix
    COLLECTIONS: {
      CLIENTS: 'Clients',
      SERVICES: 'Services',
      // ... other collections
    }
  },
  GOOGLE_SHEETS: {
    WEB_APP_URL: 'YOUR_APPS_SCRIPT_URL',
    // ... other settings
  }
};
```

### URL Parameters
- `?clientId=123` - Load specific client by ID
- `?sheetId=ABC123` - Load data from specific Google Sheet
- `?companyName=Company&location=City` - Load with URL parameters

## 🎨 Design Features

- **Cyberpunk Aesthetic**: Dark theme with cyan accents and glowing effects
- **Sticky Navigation**: Header and search remain accessible while scrolling
- **Responsive Layout**: Adapts to desktop, tablet, and mobile screens
- **Interactive Elements**: Hover effects, smooth transitions, and dynamic content
- **Typography**: Modern Poppins font family with proper hierarchy

## 📊 Data Sources

### Google Sheets Integration
- Client information and contact details
- Service listings and descriptions
- Technician profiles and schedules
- Policy documentation
- Service area coverage

### Wix CMS Integration
- Dynamic content management
- Real-time data updates
- Advanced search and filtering
- Backend API integration

## 🌤️ Weather Integration

Real-time weather data powered by:
- **Open-Meteo API**: 7-day weather forecasts
- **Nominatim**: Location geocoding
- **Automatic Updates**: Weather refreshes every hour

## 👥 Technician Management

Advanced features for technician coordination:
- **Smart Search**: Find technicians by name, ZIP code, or service area
- **Schedule Display**: Current availability and working hours
- **Service Filtering**: Match technicians to specific service needs
- **Contact Information**: Direct access to phone numbers and details

## 📋 Service Management

Comprehensive service tracking:
- **Frequency Badges**: Visual indicators for service intervals
- **Service Categories**: Organized by type and priority
- **Detailed Descriptions**: Complete service information
- **Pest Coverage**: Specific pest control details

## 🛡️ Policy Organization

Structured policy management:
- **Categorized Policies**: Grouped by department and type
- **Toggle Functionality**: Expand/collapse policy sections
- **Default Settings**: Quick access to standard procedures
- **Option Lists**: Multiple choice policies with clear options

## 📱 Mobile Optimization

Fully responsive design with:
- **Touch-Friendly Interface**: Optimized for mobile interaction
- **Adaptive Layout**: Content reorganizes for smaller screens
- **Fast Loading**: Optimized performance on mobile networks
- **Accessibility**: WCAG compliant for all users

## 🔒 Security & Privacy

- **Client-Side Only**: No sensitive data stored locally
- **API Security**: Secure communication with backend services
- **Data Validation**: Input sanitization and validation
- **CORS Compliance**: Proper cross-origin resource sharing

## 🚀 Deployment Options

### GitHub Pages
```bash
# Enable GitHub Pages in repository settings
# Access at: https://YOUR_USERNAME.github.io/call-center-profiles
```

### Wix Integration
```javascript
// Embed as iframe or integrate directly
<iframe src="https://YOUR_USERNAME.github.io/call-center-profiles" 
        width="100%" height="100%"></iframe>
```

### Custom Hosting
Upload all files to any web server that supports HTML, CSS, and JavaScript.

## 🛠️ Development

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)
- Node.js (for development server, optional)

### Local Development
```bash
# Start development server
npm start

# Or open directly
open index.html
```

### Making Changes
1. Edit HTML structure in `index.html`
2. Modify styles in `styles.css`
3. Update logic in `app.js`
4. Configure settings in `config.js`

### Testing
- Test responsive design using browser dev tools
- Verify functionality across different browsers
- Test with various data sources and configurations

## 📈 Performance

- **Load Time**: < 2 seconds on standard connections
- **Bundle Size**: Minimal dependencies, optimized assets
- **Caching**: Browser caching for static resources
- **Lazy Loading**: Weather and external data loads asynchronously

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For setup assistance or technical support:
1. Check the [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
2. Review the configuration in `config.js`
3. Test with sample data first
4. Check browser console for error messages

## 🎯 Use Cases

### Call Centers
- Client information during support calls
- Technician dispatch and scheduling
- Service history and policy reference
- Real-time weather for field services

### Service Companies
- Customer profile management
- Service tracking and scheduling
- Policy compliance monitoring
- Territory and coverage management

### Customer Support
- Quick access to client information
- Service status and history
- Policy and procedure reference
- Contact and scheduling details

## 🔄 Updates

The system is designed for easy updates:
- Configuration changes via `config.js`
- Style updates in `styles.css`
- Feature additions in `app.js`
- Backend integration via dedicated modules

Check for updates regularly and follow the setup guide for upgrade procedures.
