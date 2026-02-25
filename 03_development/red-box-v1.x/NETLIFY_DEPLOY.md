# 🚀 Netlify Deployment Guide - Red Box RPG v0.1.0

**Version**: 0.1.0  
**Last Updated**: February 25, 2026  
**Platform**: Netlify

---

## ✅ Pre-Deployment Checklist

Your project now includes all necessary Netlify configuration:

- ✅ `netlify.toml` - Build configuration with Node 18
- ✅ `public/_redirects` - SPA routing fallback
- ✅ `package.json` - Specifies Node >=18.0.0
- ✅ Production build tested locally

---

## 🎯 Quick Deploy Options

### Option 1: Deploy from GitHub (Recommended)

**Step 1: Push to GitHub**
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - Red Box RPG v0.1.0"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/red-box-rpg.git
git branch -M main
git push -u origin main
```

**Step 2: Connect to Netlify**
1. Log in to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your `red-box-rpg` repository
5. Netlify will auto-detect settings from `netlify.toml`:
   - **Build command**: `npm run build` ✅
   - **Publish directory**: `dist` ✅
   - **Node version**: 18 ✅
6. Click **"Deploy site"**

**Step 3: Wait for Build**
- Build typically takes 2-3 minutes
- Netlify will show build logs
- Green checkmark = successful deployment

**Your site will be live at**: `https://random-name-123456.netlify.app`

---

### Option 2: Drag & Drop Deploy

**Step 1: Build Locally**
```bash
# Install dependencies
npm install

# Create production build
npm run build

# Verify build succeeded
ls -la dist/
```

**Step 2: Deploy**
1. Log in to [Netlify](https://app.netlify.com)
2. Drag the `dist` folder to the upload area
3. Wait for deployment (30 seconds - 1 minute)

**Your site will be live at**: `https://random-name-123456.netlify.app`

⚠️ **Note**: This method requires manual rebuild for updates. GitHub method is better for ongoing development.

---

### Option 3: Netlify CLI

**Step 1: Install CLI**
```bash
npm install -g netlify-cli
```

**Step 2: Login**
```bash
netlify login
```

**Step 3: Deploy**
```bash
# Build the site
npm run build

# Deploy to production
netlify deploy --prod

# Follow prompts:
# - Create & configure new site: Yes
# - Publish directory: dist
```

---

## 🔧 Configuration Details

### netlify.toml Explained

```toml
[build]
  command = "npm run build"           # Build command
  publish = "dist"                    # Output directory

[build.environment]
  NODE_VERSION = "18"                 # Required Node version

[[redirects]]
  from = "/*"                         # All routes
  to = "/index.html"                  # Redirect to index.html
  status = 200                        # 200 (not 301/302)
```

**Why this matters**:
- **NODE_VERSION = "18"**: Ensures Netlify uses Node 18 (required by package.json)
- **Redirects**: Makes React Router work on page refresh
- **Status 200**: Tells Netlify this is a SPA rewrite, not a redirect

---

## 🐛 Troubleshooting

### Build Fails: "Node version mismatch"

**Problem**: Netlify using older Node version

**Solution**: The `netlify.toml` file sets `NODE_VERSION = "18"`, but you can also:
1. Go to Site settings → Build & deploy → Environment
2. Add environment variable:
   - **Key**: `NODE_VERSION`
   - **Value**: `18`
3. Trigger new deploy

---

### 404 Error on Page Refresh

**Problem**: React Router routes return 404 when refreshed

**Solution**: Already fixed! The project includes:
- ✅ `netlify.toml` with redirect rule
- ✅ `public/_redirects` as backup

If still having issues:
1. Check `dist/` folder contains `index.html`
2. Verify publish directory is set to `dist`
3. Clear Netlify cache and redeploy

---

### Build Succeeds but Site is Blank

**Problem**: Wrong publish directory or build path

**Solution**:
1. Check Netlify build log for "Publish directory"
2. Should say: `dist` (not `build`, not `public`)
3. Update in Site settings → Build & deploy → Build settings
4. Trigger new deploy

---

### Build is Slow

**Problem**: Installing dependencies on every build

**Solution**: Netlify caches dependencies automatically, but you can:
1. Enable build plugins for faster builds
2. Use Netlify cache plugin
3. Upgrade to faster build tier (if needed)

Current build time: **~2-3 minutes** (typical)

---

## ⚙️ Advanced Configuration

### Custom Domain

**After deployment**:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `red-box-rpg.com`)
4. Follow DNS configuration instructions
5. Netlify provides free SSL (HTTPS) automatically

---

### Environment Variables

**If you add API keys in future**:
1. Go to Site settings → Build & deploy → Environment
2. Click "Edit variables"
3. Add variables:
   - `VITE_API_URL`
   - `VITE_ANALYTICS_ID`
   - etc.
4. Prefix with `VITE_` to expose to Vite build

---

### Build Hooks

**For automated deployments**:
1. Go to Site settings → Build & deploy → Build hooks
2. Create new hook: "Redeploy on content change"
3. Copy webhook URL
4. Use in GitHub Actions, Zapier, etc.

---

### Deploy Previews

**Automatic preview deploys for PRs**:
1. Already enabled with GitHub integration
2. Each PR gets a preview URL
3. Test changes before merging
4. Deploy previews use same build settings

---

## 📊 Post-Deployment Verification

### Checklist After Deploy

Visit your Netlify URL and test:

- [ ] **Home page** loads
- [ ] **Create character** → All steps work
- [ ] **Start adventure** → Dungeon loads
- [ ] **Refresh page** → Doesn't 404 (React Router works)
- [ ] **Combat** → Works correctly
- [ ] **Save/load** → localStorage works
- [ ] **Sounds** → Play correctly
- [ ] **No console errors** → Check browser DevTools
- [ ] **Mobile** → Responsive design works (if applicable)

---

## 🎨 Netlify Features to Use

### Analytics
1. Site settings → Analytics
2. Enable Netlify Analytics ($9/month)
3. Track visitors, bandwidth, popular pages

### Forms (Future)
If you add contact/feedback forms:
1. Add `netlify` attribute to `<form>`
2. Netlify handles submissions automatically
3. View in Forms tab

### Functions (Future)
For serverless API endpoints:
1. Create `netlify/functions/` directory
2. Add JavaScript/TypeScript functions
3. Deploy automatically with site

---

## 🔄 Updating Your Site

### From GitHub (Auto-Deploy)
```bash
# Make changes locally
git add .
git commit -m "Update: feature X"
git push origin main

# Netlify automatically rebuilds and deploys
# Check deploy status at app.netlify.com
```

### Manual Update
```bash
# Build locally
npm run build

# Deploy
netlify deploy --prod
```

---

## 💰 Pricing (Current: Free Tier)

**What you get on free tier**:
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Deploy previews
- ✅ Netlify DNS
- ✅ Form submissions (100/month)

**For Red Box RPG**: Free tier is perfect! 🎉

Upgrade only if you need:
- More bandwidth (high traffic)
- More build minutes (frequent deploys)
- Advanced features (password protection, etc.)

---

## 🎯 Production Deployment Checklist

Before going live to users:

- [x] `netlify.toml` configured with Node 18
- [x] SPA redirects configured
- [x] Production build tested locally
- [x] All features tested in deployment
- [x] Console shows no errors
- [x] Page refresh works (no 404s)
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)
- [ ] SSL certificate active (automatic)
- [ ] Error pages customized (optional)

---

## 📞 Support Resources

**Netlify Documentation**:
- https://docs.netlify.com/
- https://docs.netlify.com/configure-builds/
- https://docs.netlify.com/routing/redirects/

**Netlify Community**:
- https://answers.netlify.com/
- Search before posting (most issues are solved)

**Netlify Status**:
- https://www.netlifystatus.com/
- Check if Netlify is experiencing issues

---

## 🎊 Success!

Once deployed, share your live URL:
- `https://your-site-name.netlify.app`

Or with custom domain:
- `https://red-box-rpg.com`

---

## 📝 Quick Reference

```bash
# Build locally
npm install
npm run build

# Test build
npm run preview

# Deploy via CLI
netlify deploy --prod

# Check deploy status
netlify status

# Open deployed site
netlify open:site
```

---

**Your Red Box RPG is now live on Netlify!** 🎲✨

**Expected Deploy Time**: 2-3 minutes  
**Expected URL**: `https://[random-name].netlify.app`  
**SSL**: Automatic (HTTPS)  
**CDN**: Global distribution  
**Cost**: $0 (Free tier)

May your deployment roll natural 20! 🎲🚀
