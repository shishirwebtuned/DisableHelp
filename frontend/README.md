# Disable Help Platform

A comprehensive NDIS-style marketplace platform connecting support workers with clients, built with modern frontend technologies.

## 🚀 Project Overview

This is a **frontend-only** implementation of a disability support marketplace platform similar to Mable. The platform features three distinct user roles (Support Workers, Clients, and Admins) with role-specific dashboards and functionality.

### Key Features

- ✅ **Three Dashboard Variants**: Classic Sidebar, Modern Minimal, Enterprise Admin
- ✅ **Role-Based Access**: Support Worker, Client, and Admin dashboards
- ✅ **Profile Management**: Comprehensive profile builder with progress tracking
- ✅ **Job Marketplace**: Browse, search, and apply for support positions
- ✅ **Invoice System**: Submit and track invoices with approval workflows
- ✅ **Messaging**: In-platform communication between users
- ✅ **Session Management**: Calendar and scheduling for clients
- ✅ **Credential Tracking**: Manage certifications and qualifications
- ✅ **Mock Data**: Fully functional with Redux-based mock data
- ✅ **Backend-Ready**: Axios instance configured for easy API integration

## 🛠️ Tech Stack

### Core Technologies
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library

### State Management & Data
- **Redux Toolkit** - Centralized state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client (configured, ready for backend)

### UI/UX
- **Lucide Icons** - Icon system
- **date-fns** - Date manipulation
- **Responsive Design** - Mobile-first approach
- **Dark Mode Ready** - Theme support built-in

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/              # Authentication pages
│   ├── (worker)/
│   │   └── worker/             # Support worker dashboard
│   │       ├── profile/        # Profile management
│   │       ├── jobs/           # Job browsing
│   │       ├── clients/        # Client management
│   │       ├── invoices/       # Invoice submission
│   │       ├── inbox/          # Messaging
│   │       └── settings/       # Account settings
│   ├── (client)/
│   │   └── client/             # Client dashboard
│   │       ├── profile/        # Client profile
│   │       ├── sessions/       # Session calendar
│   │       ├── workers/        # Worker management
│   │       ├── jobs/           # Job postings
│   │       └── inbox/          # Messaging
│   ├── (admin)/
│   │   └── admin/              # Admin dashboard
│   │       ├── users/          # User management
│   │       ├── agreements/     # Agreement oversight
│   │       ├── invoices/       # Invoice compliance
│   │       └── messages/       # Message oversight
│   ├── layout.tsx              # Root layout with Redux
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/                 # Layout components
│   │   ├── ClassicLayout.tsx   # Dashboard Style A
│   │   ├── ModernLayout.tsx    # Dashboard Style B
│   │   ├── EnterpriseLayout.tsx # Dashboard Style C
│   │   └── DashboardWrapper.tsx # Layout switcher
│   ├── forms/                  # Form components
│   └── common/                 # Shared components
├── redux/
│   ├── store.ts                # Redux store configuration
│   ├── provider.tsx            # Redux Provider wrapper
│   └── slices/
│       ├── authSlice.ts        # Authentication state
│       ├── profileSlice.ts     # User profiles
│       ├── jobsSlice.ts        # Job listings
│       ├── applicationsSlice.ts # Job applications
│       ├── agreementsSlice.ts  # Worker-client agreements
│       ├── invoiceSlice.ts     # Invoice management
│       ├── messagesSlice.ts    # Messaging system
│       └── uiSlice.ts          # UI preferences
├── lib/
│   ├── axios.ts                # Axios instance with interceptors
│   ├── constants.ts            # App constants and navigation
│   └── utils.ts                # Utility functions
├── hooks/
│   └── redux.ts                # Typed Redux hooks
├── types/
│   └── index.ts                # TypeScript type definitions
└── styles/
    └── globals.css             # Global styles
```

## 🎨 Dashboard Variants

### Dashboard Style A - Classic Sidebar
- Collapsible left sidebar
- Top header with notifications
- Traditional layout
- Best for: Standard desktop usage

### Dashboard Style B - Modern Minimal
- Floating sidebar with glassmorphism
- Card-based navigation
- Clean whitespace design
- Best for: Modern, aesthetic-focused users

### Dashboard Style C - Enterprise Admin
- Persistent slim sidebar
- Sub-navigation tabs
- Analytics-friendly layout
- Best for: Admin users and data-heavy workflows

**Switch between layouts**: Use Redux `uiSlice` to change `dashboardVariant`

## 👥 User Roles & Features

### Support Worker
- **Profile Builder**: Personal info, availability, credentials, work history
- **Job Search**: Browse and apply for positions
- **Client Management**: Track active, pending, and past clients
- **Invoice Submission**: Submit invoices with validation (requires active agreement)
- **Messaging**: Communicate with clients
- **Settings**: Account preferences and emergency contacts

### Client
- **Profile Management**: Condition, preferences, location
- **Session Calendar**: Create and manage support sessions
- **Worker Management**: Hire, manage, and terminate workers
- **Job Postings**: Create jobs and review applications
- **Messaging**: Communicate with workers

### Admin
- **Platform Metrics**: Total users, credential status
- **Agreement Oversight**: Terms acceptance, compliance
- **Invoice Management**: Approve/reject invoices, add notes
- **Message Oversight**: View all conversations
- **User Management**: Platform-wide user administration

## 🔄 Redux State Flow

### State Slices

```typescript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean
  },
  profile: {
    workerProfile: WorkerProfile | null,
    clientProfile: ClientProfile | null,
    loading: boolean
  },
  jobs: {
    jobs: Job[],
    applications: Application[],
    viewMode: 'card' | 'table'
  },
  invoices: {
    items: Invoice[],
    loading: boolean
  },
  messages: {
    conversations: Conversation[],
    loading: boolean
  },
  ui: {
    dashboardVariant: 'classic' | 'modern' | 'enterprise',
    sidebarOpen: boolean,
    theme: 'light' | 'dark'
  }
}
```

### Mock Data
All slices use `createAsyncThunk` with mock delays to simulate API calls. This makes backend integration seamless - just replace mock functions with actual API calls.

## 🔌 Backend Integration

### Axios Configuration

The Axios instance is pre-configured in `src/lib/axios.ts`:

```typescript
// Base URL from environment variable
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Request interceptor adds auth token
config.headers.Authorization = `Bearer ${token}`

// Response interceptor handles errors globally
```

### Connecting to Backend

1. **Set Environment Variable**:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-api.com/api
   ```

2. **Replace Mock Thunks**:
   ```typescript
   // Before (Mock)
   export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
     await new Promise(resolve => setTimeout(resolve, 1000));
     return mockJobs;
   });

   // After (Real API)
   export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
     const response = await api.get('/jobs');
     return response.data;
   });
   ```

3. **Update Type Definitions**: Ensure backend response types match `src/types/index.ts`

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Quick Login (Mock Credentials)

The login page has quick-fill buttons for testing:

- **Worker**: `support@example.com` / `password`
- **Client**: `client@example.com` / `password`
- **Admin**: `admin@example.com` / `password`

## 🎯 Key Implementation Details

### Profile Completeness Gating
Workers cannot submit invoices or apply for jobs until profile is 100% complete. Progress bar tracks:
- Personal Info ✓
- Location ✓
- Availability ✓
- Hourly Rate ✓
- Bank Details ✗
- Work History ✓
- Credentials ✓
- Languages ✓

### Invoice Validation Rules
- Cannot submit unless agreement status is `ACTIVE`
- Must have accepted Terms & Conditions
- Frequency options: Weekly, Fortnightly, Monthly
- Statuses: Submitted → Approved → Paid (or Rejected)

### Job Application Flow
1. Worker browses jobs (card or table view)
2. Views job details
3. Submits application with cover letter
4. Status tracked: Pending → Accepted/Rejected/Withdrawn

### Agreement Lifecycle
1. Client accepts worker application
2. Agreement created with `pending` status
3. Terms & Conditions modal presented
4. Upon acceptance, status → `active`
5. Worker can now submit invoices
6. Either party can terminate (reason required)

## 🎨 UI/UX Principles

- **Semantic Colors**: Consistent color system for status indicators
- **Skeleton Loaders**: Smooth loading states
- **Empty States**: Helpful messaging when no data exists
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Accessibility**: Semantic HTML, ARIA labels where needed
- **Smooth Transitions**: Polished animations and hover effects

## 📝 Environment Variables

Create `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_MESSAGING=true
NEXT_PUBLIC_ENABLE_INVOICING=true
```

## 🔐 Security Considerations

- Auth tokens stored in localStorage (client-side only)
- Axios interceptors handle token refresh
- Role-based route protection ready (implement in middleware)
- Input validation with Zod schemas
- XSS protection via React's built-in escaping

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Other Platforms
```bash
npm run build
# Deploy the .next folder
```

## 📦 Future Enhancements

- [ ] Route guards with middleware
- [ ] Real-time messaging with WebSockets
- [ ] File upload functionality
- [ ] Advanced search and filtering
- [ ] Calendar integration
- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Analytics dashboard
- [ ] Multi-language support

## 🤝 Contributing

This is a frontend-only implementation. When connecting to a backend:

1. Ensure API endpoints match the expected structure
2. Update type definitions in `src/types/index.ts`
3. Replace mock thunks in Redux slices
4. Test authentication flow
5. Implement proper error handling

## 📄 License

MIT License - feel free to use this project as a template.

## 🙏 Acknowledgments

- **shadcn/ui** for the excellent component library
- **Next.js** team for the amazing framework
- **Redux Toolkit** for simplified state management

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

For questions or issues, please refer to the documentation or create an issue in the repository.
#   d i s a b l e _ h e l p  
 #   d i s a b l e _ h e l p  
 