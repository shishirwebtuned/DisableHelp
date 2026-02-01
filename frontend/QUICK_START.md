# Quick Start Guide - Disable Help Platform

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to project directory
cd my-app

# Install dependencies (if not already done)
npm install

# Run development server
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 🔐 Test Login Credentials

### Support Worker Account
- **Email:** `support@example.com`
- **Password:** `password`
- **Dashboard:** `/worker`

### Client Account
- **Email:** `client@example.com`
- **Password:** `password`
- **Dashboard:** `/client`

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `password`
- **Dashboard:** `/admin`

> 💡 **Tip:** The login page has quick-fill buttons for each role!

---

## 🎨 Switching Dashboard Styles

1. Log in with any account
2. Navigate to **Settings** (gear icon in sidebar)
3. Go to **Appearance** tab
4. Click on your preferred dashboard style:
   - **Classic Sidebar** - Traditional layout
   - **Modern Minimal** - Floating sidebar with glassmorphism
   - **Enterprise Admin** - Professional data-dense layout

The change applies immediately!

---

## 📱 Exploring Features

### As a Support Worker

#### 1. Complete Your Profile
- Go to **Profile** from sidebar
- Fill in all tabs (Personal, Location, Rate, etc.)
- Watch the completeness progress bar
- **Note:** Must be 100% complete to apply for jobs or submit invoices

#### 2. Browse Jobs
- Click **Jobs** in sidebar
- Switch between Card and Table views
- Use search to filter jobs
- Click any job to view details
- Apply with a cover letter

#### 3. Submit an Invoice
- Go to **Invoices**
- Click **New Invoice**
- Select client and period
- Enter hours worked
- Submit for approval

#### 4. Message Clients
- Click **Inbox** in sidebar
- Select a conversation
- Send messages
- Note: Admin can view all conversations

### As a Client

#### 1. Post a Job
- Go to **Jobs**
- Click **Create Job**
- Fill in job details
- Save as draft or publish immediately

#### 2. Manage Workers
- Go to **Workers**
- View active workers
- Review pending applications
- Accept or reject applicants

#### 3. View Dashboard
- See upcoming sessions
- Check pending applications
- Access quick actions

### As an Admin

#### 1. Review Invoices
- Go to **Invoices**
- Filter by status
- Click **Review** on any invoice
- Approve or reject with notes

#### 2. Monitor Platform
- View platform metrics on dashboard
- Check credential status
- Review recent activity

---

## 🛠️ Development Tips

### Project Structure
```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Dashboard layouts
│   └── common/      # Shared components
├── redux/           # State management
│   ├── store.ts
│   └── slices/
├── lib/             # Utilities
├── hooks/           # Custom hooks
└── types/           # TypeScript types
```

### Key Files
- **Redux Store:** `src/redux/store.ts`
- **Axios Config:** `src/lib/axios.ts`
- **Type Definitions:** `src/types/index.ts`
- **Navigation:** `src/lib/constants.ts`

### Adding a New Page

1. Create file in appropriate route group:
   ```typescript
   // src/app/(worker)/worker/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. Add to navigation in `src/lib/constants.ts`:
   ```typescript
   export const NAV_ITEMS = {
     worker: [
       // ... existing items
       { label: 'New Page', href: '/worker/new-page', icon: Icon },
     ],
   };
   ```

### Working with Redux

```typescript
// In your component
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchJobs } from '@/redux/slices/jobsSlice';

export default function MyComponent() {
  const dispatch = useAppDispatch();
  const { jobs, loading } = useAppSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  return <div>{/* Your UI */}</div>;
}
```

---

## 🔌 Connecting to a Backend

### Step 1: Set Environment Variable
Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://your-api.com/api
```

### Step 2: Replace Mock Thunks

**Before (Mock):**
```typescript
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockJobs;
});
```

**After (Real API):**
```typescript
import api from '@/lib/axios';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const response = await api.get('/jobs');
  return response.data;
});
```

### Step 3: Update Auth Flow
Replace mock login in `authSlice.ts` with real API calls.

---

## 🎯 Common Tasks

### Add a shadcn/ui Component
```bash
npx shadcn@latest add [component-name]
```

### Run Production Build
```bash
npm run build
npm start
```

### Check for TypeScript Errors
```bash
npx tsc --noEmit
```

---

## 🐛 Troubleshooting

### Issue: "Module not found"
**Solution:** Run `npm install` to ensure all dependencies are installed.

### Issue: Port 3000 already in use
**Solution:** 
```bash
# Kill the process or use a different port
PORT=3001 npm run dev
```

### Issue: Changes not reflecting
**Solution:** 
- Hard refresh browser (Ctrl+Shift+R)
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

### Issue: TypeScript errors
**Solution:** Check `tsconfig.json` paths are correct and run `npm install` again.

---

## 📚 Additional Resources

- **Full Documentation:** See `README.md`
- **Implementation Status:** See `IMPLEMENTATION_STATUS.md`
- **shadcn/ui Docs:** https://ui.shadcn.com
- **Next.js Docs:** https://nextjs.org/docs
- **Redux Toolkit Docs:** https://redux-toolkit.js.org

---

## 💡 Pro Tips

1. **Use TypeScript:** All components are fully typed - leverage autocomplete!
2. **Check Console:** Mock API calls log to console for debugging
3. **Explore Layouts:** Try all 3 dashboard styles to see the differences
4. **Mobile Testing:** The app is fully responsive - test on mobile!
5. **Dark Mode:** UI is dark mode ready (toggle in Settings → Appearance)

---

## 🎉 You're Ready!

Start exploring the platform with the test accounts. Check out:
- Worker profile builder
- Job browsing and application
- Invoice submission
- Dashboard style switching
- Messaging system

**Happy coding!** 🚀

---

**Need Help?**
- Check `IMPLEMENTATION_STATUS.md` for feature completion status
- Review `README.md` for detailed architecture info
- Inspect Redux DevTools for state debugging
