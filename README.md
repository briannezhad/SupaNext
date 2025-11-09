# SupaNext Boilerplate

A lightweight, production-ready boilerplate for building applications with **Next.js 14** (App Router) and **Supabase** (Docker self-hosted).

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

This boilerplate includes:

### Next.js Application

- **Next.js 14** with App Router
- **TypeScript** configured
- **Supabase client utilities** for both client and server components
- Example pages and API routes

### Supabase Services (Self-Hosted)

- **PostgreSQL** database
- **Kong** API Gateway
- **GoTrue** authentication
- **PostgREST** REST API
- **Realtime** subscriptions
- **Storage** file management
- **Supabase Studio** dashboard
- **Edge Functions** runtime
- **Analytics** logging
- **Supavisor** connection pooler

## 📁 Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/
│   └── supabase/          # Supabase utilities
│       ├── client.ts      # Client-side Supabase client
│       └── server.ts      # Server-side Supabase client
├── supabase-docker/        # Supabase Docker configuration
├── docker-compose.yml      # Unified Docker Compose file
├── Dockerfile              # Next.js Dockerfile
├── .env                    # Environment variables
└── package.json            # Dependencies
```

## 🔧 Configuration

### Environment Variables

All configuration is in the `.env` file. Key variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase API URL (default: `http://localhost:8000`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-side only)
- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret

**⚠️ Important**: Change all default secrets before deploying to production!

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
import { supabase } from "@/lib/supabase/client";

// Use in client components
const { data, error } = await supabase.from("your_table").select("*");
```

#### Server Components

```typescript
import { createServerComponentClient } from "@/lib/supabase/server";

// Use in server components
const supabase = await createServerComponentClient();
const { data, error } = await supabase.from("your_table").select("*");
```

#### API Routes

```typescript
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
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

## 🚢 Production Deployment

For production:

1. Update all secrets in `.env`
2. Set `NODE_ENV=production`
3. Update `SITE_URL` and `SUPABASE_PUBLIC_URL` to your domain
4. Configure proper SMTP settings
5. Consider using Docker secrets or a secrets manager
6. Set up proper backups for PostgreSQL

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting/docker)

## 🤝 Contributing

This is a boilerplate template. Feel free to customize it for your needs!

## 📝 License

MIT

---

**Happy coding! 🎉**
