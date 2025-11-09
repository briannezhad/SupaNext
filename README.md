# SupaNext Boilerplate

A production-ready boilerplate for building applications with **Next.js 14** (App Router) and **Supabase** (Docker self-hosted). Features complete authentication, routing control, and a clean, maintainable codebase.

## 🚀 Quick Start

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Start everything with a single command:**
   ```bash
   docker compose up
   ```

That's it! The boilerplate will:
- Start all Supabase services (PostgreSQL, Auth, Storage, Realtime, etc.)
- Start your Next.js application
- Set up all necessary connections

**Note**: On first run, Docker will download all required images and set up the database. This may take a few minutes.

## 📋 Prerequisites

- **Docker** and **Docker Compose** installed
- **Git** installed

## 🏗️ Architecture

### Next.js Application

- **Next.js 14** with App Router
- **TypeScript** configured
- **Client-side authentication** for reliable cookie handling
- **Routing Control Center** for centralized route management
- **Protected routes** with automatic redirects
- **Server and client Supabase utilities**

### Supabase Services (Self-Hosted)

- **PostgreSQL** database
- **Kong** API Gateway
- **GoTrue** authentication
- **PostgREST** REST API
- **Realtime** subscriptions
- **Storage** file management
- **Supabase Studio** dashboard
- **Edge Functions** runtime

## 📁 Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── actions/                  # Server actions
│   │   └── auth.ts               # Authentication server actions
│   ├── api/                      # API routes
│   │   └── health/               # Health check endpoint
│   ├── auth/                     # Auth-related pages
│   │   ├── callback/            # OAuth/email callback handler
│   │   └── reset-password/      # Password reset page
│   ├── components/              # Reusable components
│   │   ├── AuthForm.tsx         # Authentication form (sign in/up/reset)
│   │   └── AuthRedirect.tsx     # Auto-redirect for authenticated users
│   ├── dashboard/               # Protected dashboard
│   │   ├── DashboardClient.tsx  # Client-side dashboard component
│   │   └── page.tsx             # Dashboard page
│   ├── forgot-password/         # Forgot password page
│   ├── login/                   # Login page
│   ├── signup/                  # Sign up page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── lib/
│   ├── routes/                  # Routing Control Center
│   │   ├── config.ts            # Route definitions and configuration
│   │   ├── navigation.ts       # Navigation hooks and utilities
│   │   ├── index.ts            # Main exports
│   │   └── README.md           # Routing documentation
│   └── supabase/               # Supabase utilities
│       ├── client.ts           # Client-side Supabase client
│       └── server.ts           # Server-side Supabase clients
├── middleware.ts               # Authentication middleware
├── docker-compose.yml          # Unified Docker Compose file
├── Dockerfile                  # Next.js Dockerfile
└── package.json                # Dependencies
```

## 🔐 Authentication Flow

This boilerplate uses **client-side authentication** for reliable cookie handling:

1. **Sign In/Sign Up**: User submits form → Client-side Supabase auth → Cookies set → Redirect to dashboard
2. **Session Management**: Middleware refreshes sessions on every request
3. **Route Protection**: 
   - Middleware redirects unauthenticated users from protected routes
   - Client components handle additional checks for sensitive pages
4. **Auto-redirect**: Authenticated users visiting login/signup are redirected to dashboard

### Key Features

- ✅ Client-side authentication (reliable cookie handling)
- ✅ Automatic session refresh via middleware
- ✅ Protected routes with automatic redirects
- ✅ Auto-redirect authenticated users away from auth pages
- ✅ Complete sign out with session clearing
- ✅ Password reset flow
- ✅ OAuth and email verification callbacks

## 🗺️ Routing Control Center

All routes are managed through a centralized routing system located in `lib/routes/`:

- **Route definitions**: All paths in one place (`ROUTES` constant)
- **Route metadata**: Labels, titles, descriptions, access requirements
- **Automatic redirects**: Based on authentication state
- **Type-safe navigation**: TypeScript support for all routes

### Usage

```typescript
import { ROUTES } from '@/lib/routes'

// Use routes in components
<Link href={ROUTES.DASHBOARD}>Dashboard</Link>
router.push(ROUTES.LOGIN)
```

See [lib/routes/README.md](./lib/routes/README.md) for complete documentation.

## 🔧 Configuration

### Environment Variables

All configuration is in the `.env` file. Key variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase API URL (default: `http://localhost:8000`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-side only)
- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `ENABLE_EMAIL_AUTOCONFIRM`: Set to `true` for development (bypasses email confirmation)

**⚠️ Important**: Change all default secrets before deploying to production!

### Email Configuration

For development, set `ENABLE_EMAIL_AUTOCONFIRM=true` in your `.env` file to bypass email confirmation.

For production, configure SMTP settings in `docker-compose.yml` (see [Documentation/EMAIL_SETUP.md](./Documentation/EMAIL_SETUP.md)).

## 🌐 Accessing Services

Once running, you can access:

- **Next.js App**: http://localhost:3000
- **Supabase Studio**: http://localhost:8000
  - Username: `supabase` (default)
  - Password: `this_password_is_insecure_and_should_be_updated` (default)
- **Supabase API**: http://localhost:8000/rest/v1/
- **Auth API**: http://localhost:8000/auth/v1/
- **Storage API**: http://localhost:8000/storage/v1/
- **Realtime API**: http://localhost:8000/realtime/v1/

## 💻 Development

### Using Supabase Client

#### Client Components

```typescript
import { createClientComponentClient } from '@/lib/supabase/client'

function MyComponent() {
  const supabase = createClientComponentClient()
  const { data, error } = await supabase.from('your_table').select('*')
}
```

#### Server Components

```typescript
import { createServerComponentClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createServerComponentClient()
  const { data, error } = await supabase.from('your_table').select('*')
}
```

#### API Routes (Admin Operations)

```typescript
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  // Use service role key for admin operations
}
```

### Hot Reload

The Next.js app is configured with hot reload. Changes to your code will automatically refresh in the browser.

## 🛠️ Common Commands

```bash
# Start all services (shows all logs)
docker compose up

# Start only Next.js service (cleaner output)
docker compose up nextjs

# Start in detached mode (background)
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service (recommended)
docker compose logs -f nextjs

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes data)
docker compose down -v

# Rebuild Next.js container
docker compose up --build nextjs
```

**💡 Tip**: To see only Next.js logs while Supabase runs in the background:

```bash
# Start all services in background
docker compose up -d

# Follow only Next.js logs
docker compose logs -f nextjs
```

## 📦 What's Included

### Authentication

- ✅ Complete sign in/sign up flow
- ✅ Password reset functionality
- ✅ Protected routes with automatic redirects
- ✅ Session management and refresh
- ✅ Sign out with complete session clearing
- ✅ Auto-redirect authenticated users from auth pages

### Routing

- ✅ Centralized route management
- ✅ Type-safe navigation
- ✅ Automatic route protection
- ✅ Redirect handling based on auth state

### Next.js Setup

- ✅ TypeScript configuration
- ✅ ESLint configuration
- ✅ App Router structure
- ✅ Global CSS styles
- ✅ Example home page with Supabase connection check
- ✅ Health check API route

### Supabase Setup

- ✅ All Supabase services configured
- ✅ Database with migrations
- ✅ Authentication ready
- ✅ Storage ready
- ✅ Realtime ready
- ✅ Edge Functions ready

## 🔒 Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Change all default secrets** before production
3. **Update dashboard credentials** in `.env`
4. **Use environment-specific configurations** for different environments
5. **Service role key** should never be exposed to the client

## 🚢 Production Deployment

For production:

1. Update all secrets in `.env`
2. Set `NODE_ENV=production`
3. Update `SITE_URL` and `SUPABASE_PUBLIC_URL` to your domain
4. Configure proper SMTP settings
5. Consider using Docker secrets or a secrets manager
6. Set up proper backups for PostgreSQL
7. Review and update all default credentials

## 📚 Key Concepts

### Client-Side Authentication

Authentication is handled client-side using `createClientComponentClient()`. This ensures cookies are properly set in the browser and work reliably with the middleware.

### Middleware

The middleware (`middleware.ts`) runs on every request and:
- Refreshes user sessions
- Protects routes based on authentication state
- Redirects users based on routing configuration

### Routing Control Center

All routes are defined in `lib/routes/config.ts`. This provides:
- Single source of truth for all routes
- Automatic redirect logic
- Type safety
- Easy route management

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting/docker)
- [Routing Control Center Docs](./lib/routes/README.md)

## 🤝 Contributing

This is a boilerplate template. Feel free to customize it for your needs!

## 📝 License

MIT

---

**Happy coding! 🎉**
