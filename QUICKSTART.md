# 🚀 Quick Start Guide

## Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 3. Test the Flow

Click the **"Add to Cart (Demo)"** button to see the complete installation flow:

1. **Intro Screen** - Product display with installation toggle
2. **Zipcode** - Enter any 6-digit zipcode (try `110001`)
3. **Location** - Select a service center from the map
4. **Vehicle** - Choose year, make, model, and type
5. **Schedule** - Pick date, time, and service preference
6. **Complete** - Products added to cart with metadata

## 🧪 Mock Mode (Enabled by Default)

The app automatically uses mock data in development mode. No backend required!

**Mock Zipcode Behavior:**
- `000000` - Returns no locations (error state)
- Any other 6-digit code - Returns 3 mock locations

**Mock Vehicle Data:**
- Years: 2020-2024
- Makes: Honda, Toyota, Ford, Tesla, etc.
- Models: Civic, Accord, Camry, etc.

## 🔧 Switching to Real API

To use real API endpoints:

1. Update `src/api/apiConfig.js` with your API URLs
2. Set `mode: 'production'` in `window.cm_nb_ra_in_config`
3. The app will automatically switch to real API calls

## 📦 Build for Production

```bash
npm run build
```

Output files in `dist/`:
- `installation-flow.js` - Main bundle
- `installation-flow.css` - Styles

## 📁 Project Structure

```
src/
├── api/
│   ├── apiConfig.js          # API configuration
│   ├── installationService.js # API calls
│   └── mockApiService.js     # Mock data (for testing)
├── components/
│   ├── InstallationFlow/     # Main flow orchestrator
│   ├── Modal/                # Reusable modal
│   ├── ProductBox/           # Product display
│   ├── Map/                  # Leaflet map
│   ├── StepZipcode/         # Zipcode validation
│   ├── StepLocation/        # Location selection
│   ├── StepVehicle/         # Vehicle registration
│   └── StepSchedule/        # Appointment scheduling
├── utils/
│   └── helpers.js           # Utility functions
├── App.jsx                  # Main app
└── main.jsx                 # Entry point
```

## 🎨 Key Features

✅ **Multi-step flow** with validation  
✅ **Interactive map** with location pins  
✅ **Chained dropdowns** for vehicle selection  
✅ **Calendar** with 3-day offset  
✅ **Time slots** (Morning, Afternoon, Late)  
✅ **Mock mode** for easy testing  
✅ **Responsive design** for all devices  
✅ **Error handling** and loading states  

## 🔍 Testing Different Scenarios

### Test Zipcode Validation
- Enter less than 6 digits → Error
- Enter `000000` → No locations found
- Enter `110001` → 3 locations shown

### Test Vehicle Flow
1. Select Year → Makes populate
2. Select Make → Models populate
3. Select Model → Types populate
4. All must be selected to continue

### Test Scheduling
- Dates start 3 days from today
- Select date first, then time slot
- Choose service preference

## 📖 Documentation

- **README.md** - Full documentation
- **INTEGRATION_GUIDE.md** - BigCommerce integration
- **This file** - Quick start

## 🐛 Common Issues

**Port already in use?**
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

**Dependencies not installing?**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Map not showing?**
- Check internet connection (uses CDN tiles)
- Check browser console for errors

## 💡 Tips

1. **Open DevTools** to see console logs
2. **Check Network tab** to see API calls
3. **Use React DevTools** to inspect component state
4. **Mock mode logs** show which API is being used

## 🎯 Next Steps

1. ✅ Test the complete flow locally
2. ✅ Customize styling to match your brand
3. ✅ Update API endpoints
4. ✅ Integrate with BigCommerce theme
5. ✅ Deploy to production

---

**Need Help?** Check the full documentation in README.md and INTEGRATION_GUIDE.md
