# BigCommerce Installation Flow - Integration Guide

## 🎯 Quick Start

### Step 1: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install:
- React 18.3.1
- React DOM 18.3.1
- Vite 5.4.11
- Leaflet 1.9.4 (for maps)
- React-Leaflet 4.2.1

### Step 2: Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Step 3: Test the Flow

1. Click the "Add to Cart (Demo)" button
2. You'll see the installation flow popup with:
   - Product display with installation toggle
   - Zipcode validation step
   - Map location selection
   - Vehicle registration form
   - Appointment scheduling

## 🔧 BigCommerce Theme Integration

### Method 1: Script Tag Integration (Recommended)

Add to your theme's `base.html` or `product.html` before `</body>`:

```html
<!-- React Installation Root -->
<div id="react-installation-root"></div>

<!-- Initial Data from BigCommerce -->
<script>
  window.initialData = {
    token: '{{ settings.storefront_api.token }}',
    endpoint: "/graphql",
    product_id_th: '{{product.id}}',
    currency_code: "{{ currency_selector.active_currency_code }}",
    mode: 'production'
  };
</script>

<!-- Load React App -->
<script type="module" src="{{cdn 'assets/installation-flow.js'}}"></script>
<link rel="stylesheet" href="{{cdn 'assets/installation-flow.css'}}">
```

### Method 2: WebDAV Upload

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Upload files from `dist/` to WebDAV:
   - `installation-flow.js` → `/content/installation-flow.js`
   - `installation-flow.css` → `/content/installation-flow.css`

3. Reference in theme:
   ```html
   <script type="module" src="/content/installation-flow.js"></script>
   <link rel="stylesheet" href="/content/installation-flow.css">
   ```

## 🎨 Customization Guide

### Update API Endpoints

Edit `src/api/apiConfig.js`:

```javascript
const API_BASE_URLS = {
  production: 'https://your-api.com',
  test: 'https://test-api.com',
  development: 'http://localhost:3000',
  local: 'http://localhost:3000'
};
```

### Customize Button Selectors

Edit `src/App.jsx` → `attachButtonListeners()`:

```javascript
// For PDP pages
case 'pdp':
  selectors = [
    '.your-custom-button-class',
    '#your-button-id',
    '[data-your-attribute]'
  ];
  break;
```

### Modify Time Slots

Edit `src/utils/helpers.js`:

```javascript
export const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (8 AM - 11 AM)', value: 'Morning' },
  { id: 'afternoon', label: 'Afternoon (11 AM - 2 PM)', value: 'Afternoon' },
  { id: 'evening', label: 'Evening (2 PM - 5 PM)', value: 'Evening' }
];
```

### Change Date Offset

Edit `src/utils/helpers.js`:

```javascript
export const getAvailableDates = (count = 14) => {
  const dates = [];
  for (let i = 5; i < count + 5; i++) { // Changed from 3 to 5 days
    dates.push(formatDate(getDateOffset(i)));
  }
  return dates;
};
```

### Update Styling

Each component has its own CSS file:
- Modal: `src/components/Modal/Modal.css`
- Product Box: `src/components/ProductBox/ProductBox.css`
- Steps: `src/components/Step*/Step*.css`

Example - Change primary color:

```css
/* Find and replace #007bff with your brand color */
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_DARKER_COLOR 100%);
```

## 🔌 API Integration

### Backend Requirements

Your backend must provide these endpoints:

#### 1. Check Zipcode
```
POST /check_zipcode
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "zipcode": "110001"
}

Response:
{
  "locations": [
    {
      "lat": "28.6139",
      "lng": "77.2090",
      "member_id": 1234
    }
  ]
}
```

#### 2. Get Vehicle Years
```
GET /get-year
Authorization: Bearer {token}

Response:
["2020", "2021", "2022", "2023", "2024"]
```

#### 3. Get Vehicle Makes
```
GET /get-make?year=2023
Authorization: Bearer {token}

Response:
["Honda", "Toyota", "Ford", "Chevrolet"]
```

#### 4. Get Vehicle Models
```
GET /get-model?year=2023&make=Honda
Authorization: Bearer {token}

Response:
["Civic", "Accord", "CR-V", "Pilot"]
```

#### 5. Get Vehicle Types
```
GET /get-type?model=Civic
Authorization: Bearer {token}

Response:
["Sedan", "Coupe", "Hatchback"]
```

#### 6. Add to Cart
```
POST /cart/add
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "productId": 123,
  "installationId": 456,
  "metadata": {
    "zipcode": "110001",
    "member_id": 1234,
    "vehicle": {
      "year": "2023",
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

Response:
{
  "success": true,
  "cartId": "abc123"
}
```

### CORS Configuration

Your backend must allow CORS from BigCommerce domain:

```javascript
// Express.js example
app.use(cors({
  origin: ['https://your-store.mybigcommerce.com'],
  credentials: true
}));
```

## 🧪 Testing Checklist

### Local Testing
- [ ] Run `npm run dev`
- [ ] Click demo button
- [ ] Test zipcode validation (6 digits)
- [ ] Verify map loads with pins
- [ ] Test vehicle dropdowns cascade correctly
- [ ] Select date and time slot
- [ ] Complete full flow

### Integration Testing
- [ ] Upload to BigCommerce
- [ ] Verify `window.initialData` is populated
- [ ] Test on PDP page
- [ ] Test on PLP page
- [ ] Test on Cart page
- [ ] Verify API calls work
- [ ] Test on mobile devices

### Production Checklist
- [ ] Update API endpoints to production
- [ ] Set `mode: 'production'` in initialData
- [ ] Test with real product data
- [ ] Verify cart integration works
- [ ] Test error handling
- [ ] Check browser console for errors

## 🐛 Common Issues & Solutions

### Issue: Modal doesn't open
**Solution:** 
- Check if `#react-installation-root` div exists
- Verify button selectors match your theme
- Check browser console for errors

### Issue: API calls return 401/403
**Solution:**
- Verify Bearer token is correct
- Check CORS headers on backend
- Ensure `window.initialData.token` is set

### Issue: Map doesn't load
**Solution:**
- Check internet connection (Leaflet uses CDN)
- Verify Leaflet CSS is loaded
- Check browser console for errors

### Issue: Dropdowns don't populate
**Solution:**
- Check API endpoints return correct format
- Verify network tab shows successful responses
- Check for JavaScript errors in console

### Issue: Build fails
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📱 Mobile Optimization

The app is fully responsive with breakpoints at:
- Desktop: > 768px
- Tablet: 640px - 768px
- Mobile: < 640px

All components stack vertically on mobile for better UX.

## 🚀 Performance Tips

1. **Lazy Load Map**: Only load Leaflet when needed
2. **Debounce API Calls**: Add debouncing to prevent excessive calls
3. **Cache Vehicle Data**: Store year/make/model in localStorage
4. **Optimize Images**: Use WebP format for product images
5. **Code Splitting**: Split large components into chunks

## 📊 Analytics Integration

Add tracking to key events:

```javascript
// In InstallationFlow.jsx
const handleZipcodeSuccess = (zipcode, locations) => {
  // Track zipcode validation
  gtag('event', 'zipcode_validated', {
    zipcode: zipcode,
    locations_found: locations.length
  });
  
  setFlowData(prev => ({...prev, zipcode, locations}));
  setCurrentStep('location');
};
```

## 🔐 Security Best Practices

1. **Never expose API keys** in frontend code
2. **Validate all inputs** on backend
3. **Use HTTPS** for all API calls
4. **Sanitize user input** before sending to backend
5. **Implement rate limiting** on API endpoints

## 📞 Support

For technical support or questions:
1. Check the README.md
2. Review this integration guide
3. Check browser console for errors
4. Contact your development team

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Compatibility:** BigCommerce Stencil Themes
