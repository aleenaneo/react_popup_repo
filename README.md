# BigCommerce Installation Flow - Vite + React

A production-ready Vite + React application that integrates seamlessly into BigCommerce Stencil themes, providing a comprehensive installation flow popup for products.

## 🚀 Features

- **Global React App** - Mounts globally and intercepts BigCommerce theme buttons
- **Multi-Step Installation Flow**:
  - ✅ Zipcode validation and service availability check
  - 🗺️ Interactive map with location selection (Leaflet)
  - 🚗 Vehicle registration with chained dropdowns
  - 📅 Appointment scheduling with calendar and time slots
- **API Integration** - Environment-based configuration with secure endpoints
- **Responsive Design** - Mobile-first, premium UI/UX
- **Production Ready** - Error handling, loading states, validation

## 📁 Project Structure

```
src/
├── api/
│   ├── apiConfig.js           # Environment-based API configuration
│   └── installationService.js # API service layer
├── components/
│   ├── InstallationFlow/      # Main orchestrator component
│   ├── Modal/                 # Reusable modal with scroll lock
│   ├── ProductBox/            # Product display with toggle
│   ├── Map/                   # Leaflet map integration
│   ├── StepZipcode/          # Zipcode validation step
│   ├── StepLocation/         # Location selection step
│   ├── StepVehicle/          # Vehicle registration step
│   └── StepSchedule/         # Appointment scheduling step
├── hooks/
│   └── useInstallationFlow.js # State management hook
├── utils/
│   └── helpers.js            # Utility functions
├── App.jsx                   # Main app component
├── main.jsx                  # Entry point
└── index.css                 # Global styles
```

## 🔧 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 BigCommerce Integration

### 1. Theme Setup

Add this to your BigCommerce theme template (before closing `</body>`):

```html
<!-- React Installation Root -->
<div id="react-installation-root"></div>

<!-- Initial Data Injection -->
<script>
  window.cm_nb_ra_in_config = {
    token: '{{ settings.storefront_api.token }}',
    endpoint: "/api/proxy-graphql",
    product_id_th: '{{product.id}}',
    currency_code: "{{ currency_selector.active_currency_code }}"
    mode: 'production' // production | test | development | local
  };
</script>

<!-- React App Bundle -->
<script type="module" src="/assets/installation-flow.js"></script>
<link rel="stylesheet" href="/assets/installation-flow.css">
```

### 2. Button Selectors

The app automatically attaches to these selectors based on page type:

**PDP (Product Detail Page):**
- `.add-to-cart-button`
- `#add-to-cart`
- `[data-add-to-cart]`

**PLP (Product Listing Page):**
- `.product-card-button`
- `.quick-add-button`

**Cart:**
- `.checkout-button`
- `#checkout`

Customize selectors in `src/App.jsx` → `attachButtonListeners()`

## 🔌 API Configuration

### Environment Modes

Configure API endpoints in `src/api/apiConfig.js`:

```javascript
const API_BASE_URLS = {
  production: 'https://api.production.example.com',
  test: 'https://api.test.example.com',
  development: 'https://api.dev.example.com',
  local: 'http://localhost:3000'
};
```

The app automatically selects the correct endpoint based on `window.cm_nb_ra_in_config.mode`.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/check_zipcode` | POST | Validate zipcode and get service locations |
| `/get-year` | GET | Get available vehicle years |
| `/get-make?year=X` | GET | Get makes for selected year |
| `/get-model?year=X&make=Y` | GET | Get models for year/make |
| `/get-type?model=Z` | GET | Get types for model |
| `/cart/add` | POST | Add products to cart with metadata |

### API Response Examples

**Zipcode Check:**
```json
{
  "locations": [
    { "lat": "28.6139", "lng": "77.2090", "member_id": 1234 }
  ]
}
```

**Vehicle Data:**
```json
["2020", "2021", "2022", "2023"]
```

**Add to Cart Payload:**
```json
{
  "productId": 123,
  "installationId": 456,
  "metadata": {
    "zipcode": "110001",
    "member_id": 1234,
    "vehicle": {
      "year": 2022,
      "make": "Honda",
      "model": "Civic",
      "type": "Sedan"
    },
    "appointment": {
      "date": "2025-12-20",
      "time": "Morning",
      "stayWithVehicle": true
    }
  }
}
```

## 🎨 Customization

### Styling

All components have dedicated CSS files. Key customization points:

- **Colors**: Update gradient colors in component CSS files
- **Fonts**: Modify in `src/index.css`
- **Modal Size**: Adjust in `src/components/Modal/Modal.css`
- **Time Slots**: Modify in `src/utils/helpers.js` → `TIME_SLOTS`

### Flow Steps

To add/remove steps:

1. Update `currentStep` state in `InstallationFlow.jsx`
2. Add new step component in `src/components/`
3. Update `renderStep()` switch statement
4. Update `handleBack()` step order

### Product Data

Mock product data is in `src/App.jsx`. In production, this should come from:
- BigCommerce GraphQL API
- Related products API
- Theme context variables

## 🗺️ Map Integration

Uses **Leaflet** (open-source alternative to Google Maps).

To switch to Google Maps:
1. Install: `npm install @react-google-maps/api`
2. Add your Google Maps API key - recommended options:
   - Inject via your theme when embedding the app (preferred for production). Example:
     ```html
     <script>
       window.cm_nb_ra_in_config = {
         // existing fields ...
         googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
         mode: 'production'
       };
     </script>
     ```
   - Or set a Vite environment variable for local/dev: add to `.env` (not committed):
     ```env
     VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
     ```
3. The app will automatically use Google Maps if a key is available; otherwise it falls back to Leaflet.

## 📅 Scheduling

- **Date Offset**: 3 days from today (configurable in `utils/helpers.js`)
- **Time Slots**: Morning (9-12), Afternoon (12-3), Late (3-6)
- **Calendar**: Displays 14 days by default

## 🔒 Security

- All API calls use Bearer token authentication
- Token retrieved from `window.cm_nb_ra_in_config.token`
- CORS headers required on backend
- Input validation on all form fields

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output files:
- `dist/installation-flow.js` - Main bundle
- `dist/installation-flow.css` - Styles
- `dist/assets/` - Static assets

### Upload to BigCommerce

1. Upload files to WebDAV `/content/` folder
2. Reference in theme templates
3. Update `mode` in `window.cm_nb_ra_in_config` to `production`

## 🧪 Testing

### Local Development

The app includes a demo interface for testing without BigCommerce:

```bash
npm run dev
```

Visit `http://localhost:5173` to see the demo.

### Mock Data

Update mock responses in `src/api/installationService.js` for testing:

```javascript
// Example: Mock zipcode response
export const checkZipcode = async (zipcode) => {
  // Return mock data for testing
  return {
    locations: [
      { lat: "28.6139", lng: "77.2090", member_id: 1234 }
    ]
  };
};
```

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

**Modal doesn't open:**
- Check if `#react-installation-root` exists in DOM
- Verify button selectors match your theme
- Check console for errors

**API calls fail:**
- Verify `window.cm_nb_ra_in_config.mode` is set correctly
- Check CORS headers on backend
- Verify Bearer token is valid

**Map doesn't load:**
- Check internet connection (Leaflet uses CDN tiles)
- Verify Leaflet CSS is loaded
- Check browser console for errors

## 📄 License

MIT

## 👥 Support

For issues or questions, please contact your development team.
