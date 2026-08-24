# ClinicHub v2 - GitHub & Deployment Instructions

## Overview
ClinicHub v2 Phase 1 is complete and ready to push to GitHub. This file contains step-by-step instructions for getting your project online.

---

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface (Recommended)

1. Go to https://github.com/new
2. Enter repository name: `clinichub-v2`
3. Enter description: "ClinicHub v2 - Veterinary clinic operations portal"
4. Select **Private** (important for clinic data security)
5. Do NOT initialize with README, .gitignore, or license (we have these)
6. Click "Create repository"

### Option B: GitHub CLI (if available)
```bash
gh repo create clinichub-v2 --private --description "ClinicHub v2 - Veterinary clinic operations portal"
```

---

## Step 2: Add Remote and Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
cd /Users/parmain/Documents/clinichub-v2

# Add the remote repository
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/clinichub-v2.git

# Rename branch to main (if not already)
git branch -M main

# Push all commits to GitHub
git push -u origin main
```

**Expected output:**
```
Enumerating objects: 45, done.
Counting objects: 100% (45/45), done.
Delta compression using up to 8 threads
Compressing objects: 100% (38/38), done.
Writing objects: 100% (45/45), 156.84 KiB | 2.34 MiB/s, done.
Total 45 (delta 12), reused 0 (delta 0), writing pack objects: 100% (45/45), 2.34 MiB/s)
remote: Resolving deltas: 100% (12/12), done.
remote:
remote: Create a pull request for 'main' on GitHub by visiting:
remote: https://github.com/YOUR_USERNAME/clinichub-v2/pull/new/main
remote:
To https://github.com/YOUR_USERNAME/clinichub-v2.git
 * [new branch] main -> main
 Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## Step 3: Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME/clinichub-v2
2. Verify you see:
   - All files and folders
   - 4+ commits in the history
   - README.md displayed
   - Green "Code" button

---

## Step 4: Deploy to Production

### Deploy to Vercel (Recommended for Next.js)

#### Option A: Through GitHub (Simplest)

1. Go to https://vercel.com/new
2. Click "Continue with GitHub"
3. Search for `clinichub-v2` repository
4. Click "Import"
5. Configuration page:
   - **Project Name**: clinichub-v2
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: ./ (default)
   - **Environment Variables**: 
     - Name: `NEXT_PUBLIC_API_BASE_URL`
     - Value: `https://clinichub-backend-1.onrender.com`
6. Click "Deploy"
7. Wait for deployment to complete (2-5 minutes)

**Your app will be live at**: `https://clinichub-v2-YOUR_USERNAME.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Log in to Vercel
vercel login

# Deploy from project directory
cd /Users/parmain/Documents/clinichub-v2
vercel

# Follow the prompts
```

### Deploy to Netlify

1. Go to https://app.netlify.com/start
2. Click "Connect to Git" > GitHub
3. Find and select `clinichub-v2`
4. Configure build:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variable:
   - **Key**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://clinichub-backend-1.onrender.com`
6. Click "Deploy"

### Deploy to AWS Amplify

1. Go to AWS Amplify console
2. Click "New app" > "Host web app"
3. Connect GitHub
4. Select `clinichub-v2`
5. Build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `.next`
   - **Node version**: 18
6. Add environment variable
7. Deploy

### Deploy to Railway or Render

Both support Next.js directly:
- **Build command**: `npm run build`
- **Start command**: `npm start`
- **Port**: 3000
- **Environment**: `NEXT_PUBLIC_API_BASE_URL=https://clinichub-backend-1.onrender.com`

---

## Step 5: Test Your Deployment

1. Visit your deployed URL
2. Test login with `admin` / `admin`
3. Navigate through all pages
4. Verify API calls work (check Network tab in DevTools)
5. Test on mobile (use DevTools responsive mode)

---

## Step 6: Setup Branch Protection (Optional but Recommended)

To protect your main branch:

1. Go to GitHub repository settings
2. Click "Branches" in left menu
3. Click "Add rule" under "Branch protection rules"
4. Pattern name: `main`
5. Enable:
   - "Require pull request reviews"
   - "Require status checks to pass"
   - "Require branches to be up to date"
6. Click "Create"

---

## Step 7: Configure Production Backend (Optional)

If you want to use a different backend for production:

1. Go to your deployment platform (Vercel/Netlify/etc)
2. Find "Environment Variables" settings
3. Update `NEXT_PUBLIC_API_BASE_URL` to your production backend URL
4. Trigger a new deployment

---

## Continuous Deployment Setup

Both Vercel and Netlify automatically deploy when you push to GitHub:

```bash
# Make changes locally
git checkout -b feature/my-feature
# ... make changes ...
npm run dev  # Test locally

# Commit and push
git add .
git commit -m "Add my feature"
git push origin feature/my-feature

# Create pull request on GitHub
# After merge to main, automatic deployment starts
```

---

## Troubleshooting Deployment

### Build Failed

**Check logs** on your deployment platform (Vercel/Netlify dashboard)

Common issues:
- Missing environment variables
- TypeScript errors
- Node version mismatch

**Solution**:
```bash
# Test locally first
npm run build
npm start

# Fix errors locally, commit, and re-deploy
```

### Environment Variables Not Working

Verify:
1. Variable name starts with `NEXT_PUBLIC_` (for client-side)
2. Correct spelling
3. No extra spaces
4. Redeployed after adding variable

### Authentication Fails on Production

1. Check `NEXT_PUBLIC_API_BASE_URL` is correct
2. Verify backend is accessible
3. Test in browser DevTools Network tab
4. Check backend CORS settings

### Deployment Hangs

- Clear cache: `git clean -fd`
- Re-push: `git push origin main --force` (careful!)
- Check deployment logs on platform

---

## Post-Deployment Checklist

- [ ] Repository is on GitHub
- [ ] Repository is set to Private
- [ ] App is deployed to production
- [ ] Login works with demo credentials
- [ ] Dashboard displays correctly
- [ ] Navigation works
- [ ] API calls succeed
- [ ] Mobile responsive design works
- [ ] Environment variables set
- [ ] CORS working with backend
- [ ] 404 pages handled
- [ ] Error boundaries in place

---

## Accessing Your Deployment

### Your URLs

| Platform | URL |
|---|---|
| GitHub | https://github.com/YOUR_USERNAME/clinichub-v2 |
| Vercel | https://clinichub-v2-YOUR_USERNAME.vercel.app |
| Netlify | https://clinichub-v2-YOUR_USERNAME.netlify.app |
| Custom Domain | (if configured) |

### GitHub Deployment Status

Go to your repository > "Actions" tab to see:
- Deployment history
- Build status
- Failed builds with error details

---

## Updating After Deployment

After any changes to your code:

```bash
# 1. Make changes locally
# 2. Test with: npm run dev
# 3. Commit changes
git add .
git commit -m "Describe your changes"

# 4. Push to GitHub
git push origin main

# 5. Deployment automatically starts on Vercel/Netlify
# Check deployment status on your platform dashboard
```

---

## Performance Monitoring

### On Vercel
- Built-in analytics
- Web Vitals tracking
- Error reporting

### On Netlify
- Analytics dashboard
- Build logs
- Deploy previews for PRs

### Manual Monitoring
1. Google Analytics (add tracking code)
2. Sentry for error tracking
3. New Relic for performance

---

## Backup & Disaster Recovery

### GitHub is Your Backup
- All code is on GitHub
- Anyone can clone it: `git clone https://github.com/YOUR_USERNAME/clinichub-v2.git`
- Full history is preserved

### To Restore Deployment
1. Re-connect repository on Vercel/Netlify
2. Automatic redeployment from GitHub

---

## Security Reminders

- [ ] Repository is Private (not Public)
- [ ] No secrets in `.env.local` (it's in `.gitignore`)
- [ ] No API keys in code
- [ ] Backend validates all requests
- [ ] Use HTTPS only in production
- [ ] Keep dependencies updated: `npm update`

---

## Next Steps

1. **Push to GitHub** (follow Step 1-3 above)
2. **Deploy to production** (follow Step 4 above)
3. **Test thoroughly** (follow Step 5 above)
4. **Start Phase 2 development** (build feature pages)

---

## Support

If you encounter issues:

1. Check deployment platform dashboard (Vercel/Netlify)
2. Review build logs for errors
3. Test locally with `npm run build && npm start`
4. Check backend is responding at `https://clinichub-backend-1.onrender.com`
5. Clear browser cache and cookies

---

## Contact

For ClinicHub support:
- Backend: https://clinichub-backend-1.onrender.com
- Original app: `/Users/parmain/Documents/Clinichub/clinichub.html`

---

**Ready to go live?** Start with Step 1 above!
