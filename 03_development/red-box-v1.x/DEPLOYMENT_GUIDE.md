# 🚀 Red Box RPG v0.1.0 - Deployment Guide

**Version**: 0.1.0 "Red Box Edition"  
**Status**: Production Ready  
**Last Updated**: February 23, 2026

---

## 📦 Package Contents

This production package includes:

```
red-box-v0.1.0-production/
├── src/                      # Complete source code
│   ├── components/           # React components
│   ├── contexts/             # State management
│   ├── data/                 # Game data
│   ├── utils/                # Business logic
│   └── styles/               # Global styles
├── docs/                     # Complete documentation
│   ├── USER_REQUIREMENTS_v0.1.0.md
│   ├── SYSTEM_DESIGN_v0.1.0.md
│   ├── TECHNICAL_ARCHITECTURE_v0.1.0.md
│   ├── TESTING_DOCUMENTATION_v0.1.0.md
│   ├── IMPLEMENTATION_ROADMAP_v0.1.0.md
│   └── VERSION_MANIFEST_v0.1.0.md
├── public/                   # Static assets
├── package.json              # Dependencies
├── vite.config.js            # Build configuration
├── index.html                # Entry HTML
├── README.md                 # Project documentation
├── LICENSE                   # Educational license
├── CHANGELOG.md              # Version history
├── RELEASE_NOTES.md          # Release information
├── VERSION                   # Version number
├── .gitignore                # Git ignore rules
└── verify-build.sh           # Build verification script
```

---

## 🏁 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Installation

```bash
# Extract the package
tar -xzf red-box-v0.1.0-production.tar.gz
cd red-box-v0.1

# Or unzip
unzip red-box-v0.1.0-production.zip
cd red-box-v0.1

# Verify build integrity
./verify-build.sh

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

---

## 🔨 Build Commands

### Development

```bash
# Start development server with hot reload
npm run dev

# Runs on http://localhost:5173
# Hot Module Replacement (HMR) enabled
# Source maps enabled
```

### Production Build

```bash
# Create optimized production build
npm run build

# Output directory: /dist
# Minified JavaScript and CSS
# Optimized assets
# Hash-based cache busting
```

### Preview Production Build

```bash
# Preview the production build locally
npm run preview

# Runs on http://localhost:4173
# Tests production build before deployment
```

### Testing

```bash
# Run unit tests (when implemented)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

**Steps**:
1. Build your project:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   - **Drag & Drop**: Drag `/dist` folder to Netlify
   - **CLI**: 
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod
     ```
   - **Git**: Connect repository for auto-deploy

**Configuration**:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Benefits**:
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Instant deploys
- ✅ Easy rollbacks

### Option 2: Vercel

**Steps**:
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

**Configuration**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Benefits**:
- ✅ Fast global CDN
- ✅ Automatic SSL
- ✅ Preview deployments
- ✅ GitHub integration

### Option 3: GitHub Pages

**Steps**:
1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to package.json:
   ```json
   {
     "homepage": "https://username.github.io/red-box-rpg",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

**Configuration**:
- Update `vite.config.js`:
  ```javascript
  export default defineConfig({
    base: '/red-box-rpg/',
    // ... rest of config
  });
  ```

**Benefits**:
- ✅ Free for public repos
- ✅ Simple deployment
- ✅ Version control integrated

### Option 4: AWS S3 + CloudFront

**Steps**:
1. Build project:
   ```bash
   npm run build
   ```

2. Create S3 bucket:
   - Enable static website hosting
   - Upload `/dist` contents

3. Create CloudFront distribution:
   - Point to S3 bucket
   - Configure SSL certificate
   - Set up cache behaviors

4. Configure error pages:
   - 403 error → /index.html (for SPA routing)
   - 404 error → /index.html

**Benefits**:
- ✅ Scalable
- ✅ Fast CDN
- ✅ Custom domain support
- ✅ Advanced caching

### Option 5: Self-Hosted

**Requirements**:
- Web server (Nginx, Apache)
- Node.js (for building)
- Domain name (optional)

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/red-box-rpg;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Apache Configuration**:
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/red-box-rpg
    
    <Directory /var/www/red-box-rpg>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` for local overrides:
```bash
# API URLs (if needed in future)
# VITE_API_URL=https://api.example.com

# Feature flags
# VITE_ENABLE_ANALYTICS=false
```

### Build Customization

Edit `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/', // Set to '/subpath/' for subdirectory deployment
  build: {
    outDir: 'dist',
    sourcemap: false, // Enable for debugging
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
});
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Run production build (`npm run build`)
- [ ] Test production build locally (`npm run preview`)
- [ ] Verify all links work
- [ ] Test on multiple browsers
- [ ] Check mobile responsiveness (if applicable)
- [ ] Verify HTTPS is enabled
- [ ] Set up proper cache headers
- [ ] Enable gzip/brotli compression
- [ ] Configure CSP headers (if needed)
- [ ] Remove any API keys or secrets
- [ ] Verify error pages work
- [ ] Test SPA routing on all pages

---

## 📊 Performance Optimization

### Build Optimizations

Already included in production build:
- ✅ Code minification (Terser)
- ✅ Tree shaking
- ✅ Asset optimization
- ✅ Hash-based cache busting
- ✅ Code splitting (vendor chunks)

### CDN Recommendations

For optimal performance:
1. **Static Assets**: Serve from CDN
2. **Cache Headers**:
   - HTML: `Cache-Control: public, max-age=300` (5 minutes)
   - JS/CSS: `Cache-Control: public, max-age=31536000, immutable` (1 year)
3. **Compression**: Enable Gzip or Brotli
4. **HTTP/2**: Enable for multiplexing

---

## 🧪 Testing Deployment

### Pre-Deployment Checklist

```bash
# Run all checks
./verify-build.sh

# Build and preview
npm run build
npm run preview

# Test critical paths:
# 1. Create character
# 2. Start adventure
# 3. Complete combat
# 4. Save/load game
# 5. Check sound effects
# 6. Test on multiple browsers
```

### Post-Deployment Verification

After deploying, verify:
- [ ] Site loads at production URL
- [ ] All routes work (refresh on any page)
- [ ] Assets load (images, fonts)
- [ ] Sounds play
- [ ] Save/load works
- [ ] No console errors
- [ ] Performance is acceptable

---

## 📈 Monitoring

### Recommended Monitoring (Future)

Consider adding:
- **Analytics**: Google Analytics, Plausible
- **Error Tracking**: Sentry, Rollbar
- **Performance**: Web Vitals, Lighthouse CI
- **Uptime**: UptimeRobot, Pingdom

### Key Metrics to Track

- Page load time
- Time to Interactive
- Error rates
- User sessions
- Popular features

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: 404 on page refresh
**Solution**: Configure server for SPA routing (see deployment configs above)

**Issue**: Assets not loading
**Solution**: Check `base` path in `vite.config.js`

**Issue**: Slow load times
**Solution**: Verify compression and CDN are enabled

**Issue**: localStorage not working
**Solution**: Ensure site is served over HTTPS

**Issue**: Build fails
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🔄 Updating

### Minor Updates (0.1.x)

```bash
# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Deploy
[use your deployment method]
```

### Major Updates (0.2.0+)

Follow migration guide in release notes for breaking changes.

---

## 📞 Support

**Issues**: https://github.com/yourusername/red-box-rpg/issues  
**Documentation**: `/docs` folder  
**Email**: your.email@example.com

---

## 📝 Production Checklist

Final checklist before going live:

- [ ] Build passes verification (`./verify-build.sh`)
- [ ] Production build created (`npm run build`)
- [ ] Tested locally (`npm run preview`)
- [ ] All browsers tested
- [ ] Documentation complete
- [ ] LICENSE file present
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] Version number correct (0.1.0)
- [ ] .gitignore configured
- [ ] Deployment platform selected
- [ ] Domain configured (if applicable)
- [ ] HTTPS enabled
- [ ] Monitoring set up (optional)
- [ ] Backup plan in place
- [ ] Rollback procedure documented

---

## 🎯 Next Steps

After successful deployment:

1. **Announce Release**
   - Post on social media
   - Submit to gaming communities
   - Share with beta testers

2. **Monitor Performance**
   - Watch for errors
   - Track user feedback
   - Monitor analytics

3. **Plan Next Version**
   - Review feedback
   - Prioritize features
   - Begin v1.0 development in new repo

---

## 🎲 Ready to Deploy!

Version 0.1.0 "Red Box Edition" is production-ready and tested. Follow the deployment guide above for your chosen platform.

**May your deployment roll natural 20!** 🎲✨

---

**Version**: 0.1.0  
**Status**: Production Ready ✅  
**Last Updated**: February 23, 2026
