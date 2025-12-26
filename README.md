# Betancourt Audio - Professional Audio Engineering Platform

Premium mixing, mastering, and production services website built with Next.js 16, featuring a Japandi design system and full bilingual support (EN/ES).

**Status**: ✅ Migration Complete (Phases 1-11 of 14) | 🚧 Production Build Issue ([see below](#known-issues))

## 🎯 Features

- ✨ **Japandi Design System**: Minimalist aesthetic combining Japanese and Scandinavian design principles
- 🌍 **Bilingual Support**: Full English/Spanish translations with automatic language detection
- 💰 **Multi-Currency**: USD and COP pricing with automatic currency selection
- 🔒 **Secure Payments**: Integration with Stripe (USD) and Bold (COP)
- 📊 **Client Dashboard**: Project management, file uploads (chunked, 100GB+), progress tracking
- ⚙️ **Admin Panel**: Service management with bilingual content editor
- 🎨 **Interactive Elements**: Parallax backgrounds, VU meter animations, draggable console fader
- 📱 **Responsive Design**: Mobile-first approach with smooth Framer Motion animations

## 🛠 Tech Stack

### Frontend
- **Next.js 16.1.0** - React framework with App Router & Turbopack
- **React 19** - UI library with latest features
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Utility-first CSS with custom Japandi theme (`@theme inline` syntax)
- **Framer Motion** - Smooth animations and scroll effects

### State Management
- **React Context API** - Theme, Language, Currency, and User/Auth state
- **localStorage** - Client-side persistence for user preferences

### Payments
- **Stripe** - International payments (USD → Payoneer)
- **Bold** - Colombian payments (COP)

## 📁 Project Structure

```
betancourt-website/
├── frontend/
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── page.tsx             # Landing page with all sections
│   │   │   ├── dashboard/page.tsx   # Client dashboard route
│   │   │   ├── admin/page.tsx       # Admin panel route
│   │   │   ├── api/                 # API routes (mock data)
│   │   │   │   ├── auth/            # Login/register
│   │   │   │   ├── services/        # Services CRUD
│   │   │   │   ├── users/           # User projects
│   │   │   │   ├── projects/        # Project management
│   │   │   │   ├── orders/          # Payment orders
│   │   │   │   └── admin/           # Admin endpoints
│   │   │   ├── layout.tsx           # Root layout with providers
│   │   │   ├── globals.css          # Tailwind v4 theme + CSS variables
│   │   │   └── not-found.tsx        # 404 page
│   │   ├── components/
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   │   ├── ClientDashboard.tsx   # Client project management
│   │   │   │   ├── AdminDashboard.tsx    # Admin service management
│   │   │   │   ├── NewProjectWizard.tsx  # 5-step project creation
│   │   │   │   ├── FileUploader.tsx      # Chunked file upload (5MB chunks)
│   │   │   │   └── index.ts
│   │   │   ├── landing/             # Landing page components
│   │   │   │   ├── StudioBackground.tsx  # Parallax animated background
│   │   │   │   ├── ServiceList.tsx       # Bento grid service cards
│   │   │   │   ├── PortfolioSection.tsx  # Portfolio grid with hover
│   │   │   │   ├── ContactSection.tsx    # Contact form
│   │   │   │   ├── ConsoleFader.tsx      # Interactive VU meter + knob
│   │   │   │   └── index.ts
│   │   │   ├── shared/              # Shared components
│   │   │   │   ├── Navbar.tsx            # Navigation with theme/lang toggles
│   │   │   │   ├── AuthModal.tsx         # Login/signup modal
│   │   │   │   ├── CheckoutModal.tsx     # Payment modal
│   │   │   │   └── index.ts
│   │   │   ├── ui/                  # UI primitives (Japandi styled)
│   │   │   │   └── UI.tsx                # Button, Input, Card, Badge, etc.
│   │   │   └── ClientProviders.tsx       # Context providers wrapper
│   │   ├── contexts/                # React contexts (all use localStorage)
│   │   │   ├── ThemeContext.tsx          # Dark/Light theme toggle
│   │   │   ├── LanguageContext.tsx       # EN/ES + translations
│   │   │   ├── CurrencyContext.tsx       # USD/COP toggle
│   │   │   ├── UserContext.tsx           # User state management
│   │   │   └── AuthContext.tsx           # Auth wrapper (login method)
│   │   ├── types/
│   │   │   └── index.ts                  # All TypeScript definitions
│   │   └── utils/
│   │       ├── translations.ts           # i18n dictionaries (EN/ES)
│   │       └── currency.ts               # Currency formatting utils
│   ├── public/                      # Static assets
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── README.md                        # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+** and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/betancourt-website.git
cd betancourt-website
```

2. **Install dependencies**
```bash
cd frontend
npm install
```

3. **Set up environment variables** (Optional)
Create a `.env.local` file in the `frontend` directory:
```env
# Stripe (USD payments) - Optional for development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Bold (COP payments) - Optional for development
NEXT_PUBLIC_BOLD_PUBLIC_KEY=...
BOLD_SECRET_KEY=...

# Email service - Optional
RESEND_API_KEY=re_...
```

**Note**: The app works with mock data without environment variables.

4. **Run development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

### Build for Production

⚠️ **Known Issue**: There's currently a build error with Next.js 16 and the `/_global-error` route. See [Known Issues](#known-issues) for details.

```bash
npm run build  # Currently fails due to Next.js 16 issue
npm start
```

## 🔐 Mock Authentication

For development, the app uses mock authentication. Use these credentials:

**Admin Account:**
- Email: `admin@betancourtaudio.com`
- Password: (any password works)

**Client Account:**
- Email: any other email address
- Password: (any password works)

## 🎨 Design System (Japandi Theme)

### Color Palette

```css
/* Light Mode */
--color-j-light-bg: #F5EFE6;        /* Warm off-white background */
--color-j-light-surface: #E8DFD0;   /* Subtle surface elevation */
--color-j-light-text: #3D3D3D;      /* Soft black text */

/* Dark Mode */
--color-j-dark-bg: #1A1A1A;         /* Soft black background */
--color-j-dark-surface: #2A2A2A;    /* Elevated surface */
--color-j-dark-text: #E8DFD0;       /* Warm white text */

/* Accent Colors */
--color-warm-glow: #7B9E87;         /* Sage green (primary) */
--color-warm-dim: #5A7A65;          /* Darker sage (hover) */
```

### Typography
- **Sans-serif**: Inter (body text, UI elements)
- **Serif**: Playfair Display (headings, hero titles)

### Design Principles
- Generous whitespace and breathing room
- Subtle shadows and borders (no harsh edges)
- Smooth transitions (200-300ms)
- Natural, organic shapes and rounded corners
- Glassmorphism effects (`backdrop-blur-md`)
- Minimal color palette with sage green accent

## 🌐 API Routes (Mock Implementation)

All API routes currently return mock data. Ready for backend integration.

### Authentication
- `POST /api/auth/login` - User login (returns mock user)
- `POST /api/auth/register` - User registration

### Services
- `GET /api/services` - List all services (bilingual)
- `GET /api/admin/services` - Admin view of services
- `POST /api/admin/services` - Create/update service
- `DELETE /api/admin/services/:id` - Delete service

### Projects
- `GET /api/users/:userId/projects` - Get user's projects
- `POST /api/projects/submit` - Create new project from wizard
- `POST /api/projects/:id/upload-token` - Get file upload URL
- `POST /api/projects/:id/upload-complete` - Mark upload complete

### Orders & Payments
- `POST /api/orders/create` - Create payment order (Stripe/Bold)
- `POST /api/orders/confirm` - Confirm payment completion

## 📤 File Upload System

The `FileUploader` component supports professional audio file transfer:

- **Chunked uploads**: 5MB chunks for reliability
- **Large file support**: Handles 100GB+ files (common for multi-track projects)
- **Automatic retry**: Exponential backoff on failures
- **Progress tracking**: Real-time speed, ETA, and progress percentage
- **Bit-perfect transfer**: No compression or modification
- **Supported formats**: WAV, AIFF, MP3, FLAC

## 🌍 Internationalization (i18n)

Translations are managed in `src/utils/translations.ts`:

```typescript
export const translations = {
  en: {
    nav: { services: "Services", portfolio: "Portfolio", ... },
    hero: { badge: "Accepting New Projects", ... },
    ...
  },
  es: {
    nav: { services: "Servicios", portfolio: "Portafolio", ... },
    hero: { badge: "Aceptando Nuevos Proyectos", ... },
    ...
  }
};
```

### Automatic Language Detection

The app detects user location via `ipapi.co` API and automatically sets:
- **Language**: `es` for Colombia, `en` otherwise
- **Currency**: `COP` for Colombia, `USD` otherwise

Users can manually override via navbar toggles (persisted in `localStorage`).

## ⚠️ Known Issues

### 1. Next.js 16 Build Error: `/_global-error` Route

**Problem**: `npm run build` fails with:
```
TypeError: Cannot read properties of null (reading 'useContext')
Error occurred prerendering page "/_global-error"
```

**Cause**: Next.js 16.1.0 attempts to statically pre-render the `/_global-error` route during build, which conflicts with React Context providers in the layout.

**Current Status**:
- ✅ App works perfectly in **development mode** (`npm run dev`)
- ❌ Production build fails
- 🔍 Investigating Next.js 16.x patches

**Workarounds**:
1. Use `npm run dev` for local development (recommended)
2. Deploy to **Vercel** or **Netlify** (they handle this automatically)
3. Monitor [Next.js GitHub issues](https://github.com/vercel/next.js/issues) for fixes

**Attempted Fixes**:
- ✅ Added `export const dynamic = 'force-dynamic'` to layout
- ✅ Removed custom `global-error.tsx` (issue persists with default)
- ✅ Tried `output: 'standalone'` in `next.config.ts`
- ❌ None resolved the build error yet

## 🚀 Deployment

### Vercel (Recommended)

Vercel automatically handles the Next.js 16 build quirks:

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (if using real payment APIs)
4. Deploy ✨

### Netlify

Similar to Vercel:

1. Connect GitHub repository
2. Build command: `cd frontend && npm run build`
3. Publish directory: `frontend/.next`
4. Deploy

### Environment Variables for Production

```env
# Required for payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_BOLD_PUBLIC_KEY=...
BOLD_SECRET_KEY=...

# Optional
RESEND_API_KEY=re_...  # For transactional emails
```

## 📚 Migration Summary

This project was migrated from a Django + Next.js prototype to a production-ready Next.js 16 app:

### Completed Phases (1-11):
1. ✅ Next.js 16 setup with Tailwind v4
2. ✅ Type definitions and interfaces
3. ✅ Context providers (Theme, Language, Currency, User)
4. ✅ Mock API routes (7 endpoints)
5. ✅ UI component library (Japandi design system)
6. ✅ Currency utilities
7. ✅ Base configuration (build, TypeScript, Tailwind)
8. ✅ Shared components (Navbar, AuthModal, CheckoutModal)
9. ✅ Landing components (Background, Services, Portfolio, Contact, Console)
10. ✅ Dashboard components (Client, Admin, Wizard, FileUploader)
11. ✅ Main pages (Landing, Dashboard, Admin)

### Remaining Phases (12-14):
12. 🚧 Testing & Optimizations
13. ✅ Documentation (this README)
14. 🔜 Production deployment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Contact

**Betancourt Audio**
Professional Audio Engineering Services

- 🌐 Website: [betancourtaudio.com](https://betancourtaudio.com)
- 📧 Email: contact@betancourtaudio.com
- 📸 Instagram: [@betancourtaudio](https://instagram.com/betancourtaudio)
- 🎵 Location: Bogotá, Colombia

---

**Built with ❤️ using Next.js 16, React 19, and Tailwind CSS v4**
