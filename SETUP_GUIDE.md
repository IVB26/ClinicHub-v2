# ClinicHub v2 - Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd /Users/parmain/Documents/clinichub-v2
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

**Demo Credentials**:
- Username: `admin`
- Password: `admin`

---

## GitHub Setup

### Option 1: GitHub Web UI (Easiest)

1. Go to https://github.com/new
2. Create a new repository named `clinichub-v2`
3. Make it **Private** (to protect your clinic's data)
4. Do NOT initialize with README (we already have one)
5. Click "Create repository"

Then run:
```bash
cd /Users/parmain/Documents/clinichub-v2
git remote add origin https://github.com/YOUR_USERNAME/clinichub-v2.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Option 2: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:
```bash
cd /Users/parmain/Documents/clinichub-v2
gh repo create clinichub-v2 --private --source=. --remote=origin --push
```

---

## Verify Installation

### Check all dependencies
```bash
npm ls
```

### Run type checking
```bash
npx tsc --noEmit
```

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

---

## Environment Configuration

### Development (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=https://clinichub-backend-1.onrender.com
```

### Production/Deployment
Create a `.env.production.local` if needed (keep it out of git for sensitive data):
```
NEXT_PUBLIC_API_BASE_URL=https://clinichub-backend-1.onrender.com
```

Note: `NEXT_PUBLIC_*` variables are exposed to the client and should only contain non-sensitive data.

---

## Project Structure Summary

```
clinichub-v2/
├── app/                    # Next.js app directory
│   ├── (auth pages)       # login, page redirects
│   └── (feature pages)    # dashboard, policies, etc.
├── components/            # React components
│   ├── AuthProvider       # Auth state management
│   ├── ProtectedLayout    # Layout wrapper
│   ├── Sidebar            # Navigation
│   └── Navbar             # Top navigation
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── auth.ts           # Auth hook
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

---

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

---

## Key Technologies

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15+ | React framework with App Router |
| React | 18+ | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Styling |
| Node.js | 18+ | Runtime |

---

## API Reference

### Authentication
All API calls are made through `lib/api.ts` which automatically includes the JWT token.

**Login**:
```typescript
import { authAPI } from '@/lib/api';

const response = await authAPI.login('admin', 'admin');
// Returns: { token: string, user: User }
```

**Policies**:
```typescript
import { policiesAPI } from '@/lib/api';

const policies = await policiesAPI.getAll();
const policy = await policiesAPI.getOne(id);
await policiesAPI.create(data);
await policiesAPI.update(id, data);
await policiesAPI.delete(id);
```

### Error Handling
All API calls throw errors that can be caught:
```typescript
try {
  await policiesAPI.getAll();
} catch (error) {
  console.error(error.message);
  // 401: Unauthorized - redirect to login
  // 403: Forbidden - insufficient permissions
  // 500: Server error
}
```

---

## Deployment Options

### Vercel (Recommended for Next.js)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select the `clinichub-v2` repository
5. Environment variables are auto-detected from `.env.local`
6. Click "Deploy"

**Vercel Deployment URL**: https://clinichub-v2.vercel.app (example)

### Netlify
1. Go to https://netlify.com
2. Click "New site from Git"
3. Connect GitHub and select `clinichub-v2`
4. Set Build command: `npm run build`
5. Set Publish directory: `.next/static`
6. Add environment variables in Netlify UI
7. Click "Deploy"

### AWS Amplify
1. Go to AWS Amplify console
2. Click "New app" > "Host web app"
3. Connect GitHub and select `clinichub-v2`
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
5. Add environment variables
6. Click "Save and deploy"

### Railway, Render, or other Node hosts
Any Node.js hosting platform can deploy Next.js:
- Build command: `npm run build`
- Start command: `npm start`
- Node version: 18+
- Port: 3000 (can be configured with PORT env var)

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore` (should be by default)
- [ ] Repository is set to Private on GitHub
- [ ] No API keys or passwords in code
- [ ] CORS properly configured on backend
- [ ] JWT tokens stored only in localStorage
- [ ] Backend validates all requests
- [ ] HTTPS enabled in production
- [ ] Rate limiting on backend
- [ ] Input validation on both frontend and backend

---

## Performance Tips

1. **Images**: Use Next.js `Image` component
2. **Code Splitting**: Automatic with App Router
3. **Caching**: Set up HTTP caching headers
4. **Database**: Consider caching on backend
5. **Search**: Implement debouncing in search inputs
6. **Pagination**: Implement for large lists

---

## Troubleshooting

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### Module not found errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run dev server again
npm run dev
```

### Authentication issues
1. Check browser DevTools > Application > Storage > localStorage
2. Verify `vl_token` is present
3. Check browser console for API errors
4. Verify backend is running and accessible
5. Check `.env.local` has correct API_BASE_URL

### Build fails
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for lint errors
npm run lint

# Try building again
npm run build
```

---

## Development Workflow

### Feature Branch
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, test locally
npm run dev

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
```

### Code Quality
- Use TypeScript - no `any` types without good reason
- Add prop types for components
- Write meaningful commit messages
- Test in browser before committing

---

## Database Considerations

ClinicHub v2 uses the existing backend API. To work locally:

**Backend must be running at**: `https://clinichub-backend-1.onrender.com`

OR update `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

If you want to run the backend locally:
```bash
cd /Users/parmain/Documents/clinichub-backend
npm install
npm run dev
```

---

## Next Steps

1. ✓ Phase 1: Foundation complete
2. Build Phase 2: Feature pages
3. Test with real data
4. Deploy to production
5. Monitor and optimize
6. Gather user feedback

---

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)

---

## License & Credits

ClinicHub v2 - Parallel rebuild of ClinicHub for veterinary clinic operations.

Original app: `clinichub.html` (single-file React app)
v2 Rebuild: Next.js with TypeScript and modern tooling
Phase 1 Foundation: Authentication + Navigation Shell
