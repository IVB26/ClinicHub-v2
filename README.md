# ClinicHub v2 - Operations Portal

A modern Next.js rebuild of the ClinicHub veterinary clinic operations portal. This is Phase 1: Foundation with authentication and navigation shell ready for feature development.

## Status: Phase 1 Complete ✓

- ✓ Next.js 15+ with TypeScript
- ✓ Tailwind CSS styling
- ✓ JWT authentication system
- ✓ Role-based access control
- ✓ Backend API integration
- ✓ Responsive navigation
- ✓ Protected routes
- ✓ Production build verified

**Ready for Phase 2**: Feature page development and full backend integration

---

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Demo Credentials**:
- Username: `admin`
- Password: `admin`

---

## Project Structure

```
clinichub-v2/
├── app/                  # Next.js pages and layouts
│   ├── login/           # Login page
│   ├── dashboard/       # Home page
│   ├── policies/        # Policies (Phase 2)
│   ├── protocols/       # Protocols (Phase 2)
│   ├── boarding/        # Boarding (Phase 2)
│   ├── content/         # Content manager (Phase 2)
│   ├── admin/           # Admin panel (Phase 2)
│   └── layout.tsx       # Root layout with auth
├── components/          # React components
│   ├── AuthProvider.tsx # Global auth state
│   ├── ProtectedLayout.tsx
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── Navbar.tsx       # Top navigation
├── lib/                 # Utilities
│   ├── api.ts          # API client
│   ├── auth.ts         # Auth hook
│   └── types.ts        # TypeScript types
└── public/             # Static files
```

---

## Key Features

### Authentication
- JWT token-based auth
- Automatic token injection in API calls
- Session persistence via localStorage
- Auto-logout on 401 errors
- Demo login with admin/admin

### Authorization
Three-tier role system:
1. **staff** - Read-only access
2. **manager** - Can edit content
3. **admin** - Full access

### Navigation
- Fixed sidebar (desktop)
- Collapsible mobile menu
- Top navbar with search and user menu
- Role-based menu filtering

### API Integration
- Centralized API client (`lib/api.ts`)
- Organized endpoint groups
- Automatic error handling
- Token management

---

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15+ | React framework |
| React | 18+ | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Styling |
| Node.js | 18+ | Runtime |

---

## Environment Variables

### .env.local
```
NEXT_PUBLIC_API_BASE_URL=https://clinichub-backend-1.onrender.com
```

This connects to the existing backend. For local development with local backend:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

---

## Development

### Run dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

### Type checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

---

## Backend API

The app integrates with the existing ClinicHub backend:

**Base URL**: `https://clinichub-backend-1.onrender.com`

**Authentication Endpoint**:
```
POST /api/auth/login
{
  "username": "admin",
  "password": "admin"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "123",
    "username": "admin",
    "role": "admin"
  }
}
```

**Other APIs**: Available through `lib/api.ts`
- Policies CRUD
- Boarding CRUD
- SMS Templates
- Custom Tabs

---

## GitHub Setup

### Create Repository

1. Go to https://github.com/new
2. Repository name: `clinichub-v2`
3. Set to **Private**
4. Click "Create repository"

### Push to GitHub

```bash
cd /Users/parmain/Documents/clinichub-v2
git remote add origin https://github.com/YOUR_USERNAME/clinichub-v2.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /Users/parmain/Documents/clinichub-v2
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com)

### Other Platforms
- **Netlify**: Connect GitHub repo, use `npm run build`
- **AWS Amplify**: Similar to Netlify setup
- **Railway/Render**: Node.js hosting

---

## Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Installation & deployment guide
- [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md) - Phase 1 completion details
- [Next.js Docs](https://nextjs.org/docs)

---

## Available Endpoints

### Public Routes
- `/login` - Login page

### Protected Routes (require authentication)
- `/` - Redirects to dashboard or login
- `/dashboard` - Home page (all roles)
- `/policies` - Policies (staff+)
- `/protocols` - Protocols (staff+)
- `/boarding` - Boarding procedures (staff+)
- `/content` - Content manager (manager+)
- `/admin` - Admin settings (admin only)

---

## Git Workflow

### Make Changes
```bash
git checkout -b feature/my-feature
# Make changes
npm run dev
# Test locally
git add .
git commit -m "Add my feature"
git push origin feature/my-feature
```

### Create Pull Request
Go to GitHub and create a pull request from `feature/my-feature` to `main`

---

## Troubleshooting

### Port 3000 in use
```bash
npm run dev -- -p 3001
```

### Clear cache and reinstall
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### TypeScript errors
```bash
npx tsc --noEmit
```

### Build fails
```bash
npm run build -- --debug
```

---

## Next Steps (Phase 2)

1. [ ] Build Policies page with CRUD
2. [ ] Build Protocols page with rich text
3. [ ] Build Boarding procedures management
4. [ ] Build Content manager
5. [ ] Build Admin dashboard
6. [ ] Add SMS template management
7. [ ] Implement search functionality
8. [ ] Add form validation
9. [ ] Create reusable components
10. [ ] Testing & QA
11. [ ] Performance optimization
12. [ ] Deploy to production

---

## Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md)
3. Check backend logs at https://clinichub-backend-1.onrender.com
4. Review browser console (F12)

---

## Security

- Keep `.env.local` out of git (in `.gitignore`)
- Don't commit API keys or secrets
- Use HTTPS in production
- Enable 2FA on GitHub
- Keep dependencies updated

---

## Version History

- **v2.0.0** - Phase 1 foundation (2026-08-24)
  - Next.js migration from single-file React app
  - Authentication system
  - Navigation shell
  - Ready for Phase 2 development

---

## License

ClinicHub - Veterinary Clinic Operations Portal

Original app: Single-file React app (`clinichub.html`)
v2 Rebuild: Next.js with modern tooling and TypeScript
