# BharatBazaar Admin Dashboard 🇮🇳
### Production-Quality Video-First Marketplace Admin Console

Built with **Next.js (latest stable, App Router) + TypeScript + Tailwind CSS**.

BharatBazaar is an Indian video-first marketplace administration dashboard engineered for short-video commerce, reel content moderation, GST verification, and seller trust management across Mumbai, Bengaluru, Delhi NCR, and 40+ tier-2/3 Indian cities.

---

## 🚀 Key Features & Modules

1. **Dashboard Overview (`/`)**:
   - Platform KPI Metrics: Total Users (186K+), Active Listings, Published Reels, Pending Reports, GST Businesses, View-to-Inquiry Engagement Rate.
   - Monthly User Acquisition & Verified Seller expansion (Recharts AreaChart).
   - Daily Video Reel Velocity & Likes chart.
   - High-priority Critical Moderation queue preview with 1-click quick actions.
   - Live verified marketplace activity stream with linked Reel indicators.

2. **Marketplace Analytics (`/analytics`)**:
   - User acquisition & retention area charts.
   - Weekly listing throughput (New vs Sold vs Flagged).
   - Video reel interaction trends (Views, Likes, Shares, Comments).
   - Category distribution donut chart (Fashion, Mobiles, Vehicles, Decor, Real Estate).
   - Regional penetration analysis across Mumbai, Bengaluru, Delhi NCR, Hyderabad, Pune, Ahmedabad, and Kochi.
   - Date range selector & CSV export trigger.

3. **User Management (`/users`)**:
   - Searchable & filterable user directory (by name, email, phone, city, role, and account status).
   - User Trust Scores (0-100%), status badges, and listing/reel tallies.
   - Detailed user drawer inspection modal.
   - Administrative actions: Suspend, Reactivate, Ban, and Grant/Revoke Verified Trust Badge.

4. **Listing Management (`/listings`)**:
   - Product catalog inventory with INR (₹) pricing, condition badges, and locations.
   - Category filters and linked short-video reel indicators.
   - Detailed listing inspector modal with image preview, dynamic specifications, seller phone, and view metrics.
   - Moderation actions: Approve, Flag for investigation, Feature on homepage, or Delete.

5. **Reel Moderation (`/reels`)**:
   - Short-video cards with 9:10 aspect ratio and duration tags.
   - Interactive modal with video player, caption, hashtags, and tagged marketplace product.
   - AI safety score (0-100%) and detected moderation violation flags (dangerous stunts, scams, copyright).
   - Review controls: Approve, Flag, 18+ Age Restrict, and Remove Content.

6. **Reports & Complaints Queue (`/reports`)**:
   - Centralized moderation queue for reported Users, Listings, and Reels.
   - Severity tags (Critical, High, Medium, Low) and violation categories (Advance UPI Scam, Illegal Stunt, Missing RERA, Copyright).
   - Reporter details, alleged entity owner, evidence logs.
   - Action controls: Dismiss report, Issue warning & quarantine, or Suspend account.

7. **Category & Attribute Schema (`/categories`)**:
   - Category hierarchy with custom icons and subcategories.
   - Dynamic Custom Attribute builder (Text, Number, Select, Boolean, Required flag) for customized listing forms.
   - Add new category and subcategory creation workflows.
   - Visibility status toggles (Active / Hidden).

8. **Business Accounts & Storefronts (`/businesses`)**:
   - Commercial merchant directory with GSTIN, PAN, and trade categories.
   - Merchant Tiers: **Silver**, **Gold**, **Diamond**.
   - Monthly GMV (₹) tracking and active catalog size.
   - Actions: Verify GSTIN, Upgrade merchant tier, and Suspend storefront.

9. **Seller KYC & Identity Verification (`/verifications`)**:
   - Verification queue for Aadhaar Card, PAN Card, and GST Certificates.
   - Side-by-side comparison of submitted official document with live applicant selfie.
   - Automated AI biometric confidence score (0-100%).
   - 1-click Approval (issuing the Blue Trust Shield) or Rejection with customizable rejection reasons.

10. **Push & In-App Notifications (`/notifications`)**:
    - Campaign creator powered by **React Hook Form + Zod**.
    - Audience cohort targeting: All Users, Active Sellers, Buyers, Business Accounts, Tier-1 Cities.
    - Delivery channel options: Mobile Push, In-App banner, or Both.
    - Delivery metrics tracking: Recipients, Open Rate %, CTR %.
    - Instant test push notification simulation.

11. **Sponsored Reels & Advertisements (`/ads`)**:
    - Manage sponsored video reels, featured listings, and homepage banner takeovers.
    - Performance tracking: Daily Budget, Total Spend (₹), Impressions, Clicks, CTR %.
    - Create new campaign modal and 1-click Pause/Resume controls.

12. **Audit Trails & Security Logs (`/audit-logs`)**:
    - Searchable administrative activity log.
    - Captures initiating admin, role, action, target entity, timestamp, and IP location.
    - Inspect full action details and payload modal.
    - Export audit trail action.

13. **Platform Settings & Preferences (`/settings`)**:
    - Admin profile management with contact info and department.
    - Two-Factor Authentication (2FA) toggle.
    - Operational marketplace controls: Max reel duration (seconds), Max upload size (MB), AI moderation sensitivity, Maintenance mode switch, and New user registration toggles.

---

## 🛠️ Technology Stack & Dependencies

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Icons**: `lucide-react`
- **Charts & Visualizations**: `recharts`
- **Data Tables & State**: `@tanstack/react-table`
- **Forms & Validation**: `react-hook-form`, `zod`, `@hookform/resolvers`
- **Notifications & Toasts**: `sonner`
- **Date Utilities**: `date-fns`
- **Component Styling**: `clsx`, `tailwind-merge`, `class-variance-authority`

---

## 📁 Project Architecture

```
admin/
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── layout.tsx          # Root layout with AdminShell & fonts
│   │   ├── globals.css         # SaaS color tokens & custom scrollbars
│   │   ├── page.tsx            # (1) Dashboard Overview
│   │   ├── analytics/          # (2) Analytics & Intelligence
│   │   ├── users/              # (3) User Management
│   │   ├── listings/           # (4) Listing Moderation
│   │   ├── reels/              # (5) Reel Moderation
│   │   ├── reports/            # (6) Reports & Complaints Queue
│   │   ├── categories/         # (7) Category & Dynamic Attributes
│   │   ├── businesses/         # (8) Verified Business Accounts
│   │   ├── verifications/      # (9) KYC & Identity Documents
│   │   ├── notifications/      # (10) Notification Campaigns
│   │   ├── ads/                # (11) Advertisements & Sponsored Reels
│   │   ├── audit-logs/         # (12) Security Audit Logs
│   │   └── settings/           # (13) Settings & Platform Preferences
│   ├── components/
│   │   ├── layout/             # Core Admin Layout
│   │   │   ├── admin-shell.tsx # Responsive shell & toast provider
│   │   │   ├── sidebar.tsx     # Collapsible navigation sidebar
│   │   │   ├── header.tsx      # Navbar, breadcrumbs, search, alerts
│   │   │   └── mobile-nav.tsx  # Mobile drawer navigation
│   │   └── ui/                 # Reusable UI Component Library
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── confirm-modal.tsx
│   │       ├── dialog.tsx
│   │       ├── empty-state.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       ├── stat-card.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   ├── lib/
│   │   ├── utils.ts            # Formatting (INR, numbers, dates) & cn()
│   │   └── mock-data/          # Centralized Mock Data Layer
│   │       ├── users.ts
│   │       ├── listings.ts
│   │       ├── reels.ts
│   │       ├── reports.ts
│   │       ├── categories.ts
│   │       ├── businesses.ts
│   │       ├── verifications.ts
│   │       ├── notifications.ts
│   │       ├── ads.ts
│   │       ├── audit-logs.ts
│   │       ├── analytics.ts
│   │       └── index.ts
│   └── types/                  # Centralized TypeScript Models
│       └── index.ts
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## 🏃 Available Scripts

Inside the `admin/` directory:

- `npm run dev`: Starts the local Turbopack development server on `http://localhost:3000`
- `npm run build`: Compiles production build with strict TypeScript checking
- `npm run start`: Runs the built production server
- `npm run lint`: Runs ESLint validation
