# SupaNext - Next.js + Supabase Boilerplate

A lightweight, production-ready boilerplate for building applications with Next.js (UI + API) and Supabase as your Backend-as-a-Service.

## 🚀 Quick Start

Start everything with a single command:

```bash
docker compose up
```

That's it! The entire stack will be running:

- **Next.js App**: http://localhost:3000

> **Note**: Make sure to configure your Supabase credentials in `.env` file before starting.

## 📁 Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/
│   └── supabase/          # Supabase client utilities
│       ├── client.ts      # Client-side Supabase client
│       └── server.ts      # Server-side Supabase client
├── docker-compose.yml     # Docker orchestration
├── Dockerfile             # Next.js container
└── package.json           # Dependencies
```

## 🛠️ Architecture

### Client-Side

- Use `lib/supabase/client.ts` for browser/client components
- Automatically handles authentication and real-time subscriptions

### Server-Side

- Use `lib/supabase/server.ts` for API routes and server components
- Uses service role key for admin operations

## 🔧 Configuration

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Update `.env` with your Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find these values in your Supabase project settings under API.

## 📝 Development

### Running in Development Mode

```bash
docker compose up
```

The Next.js app runs in development mode with hot-reload enabled.

### Building for Production

```bash
docker compose build
docker compose up
```

### Accessing Services

- **Next.js**: http://localhost:3000

### Supabase Connection

The application connects to your Supabase project using the credentials in your `.env` file. Make sure you have:

1. Created a Supabase project at [supabase.com](https://supabase.com)
2. Copied your project URL and API keys to `.env`
3. Set up your database schema in the Supabase dashboard

## 🎯 Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript support
- ✅ Supabase integration (client & server)
- ✅ Docker Compose setup
- ✅ Hot-reload development
- ✅ Production-ready Dockerfile
- ✅ Health check API endpoint

## 📦 Dependencies

- **Next.js 14**: React framework with App Router
- **Supabase JS**: Official Supabase client library
- **TypeScript**: Type safety
- **Docker**: Containerization

## 🔍 API Endpoints

- `GET /api/health` - Health check endpoint

## 🚢 Production Deployment

The Dockerfile is configured for production with:

- Multi-stage builds for smaller image size
- Standalone Next.js output
- Non-root user for security
- Optimized caching

## 📚 Next Steps

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Configure your `.env` file with Supabase credentials
3. Set up your database schema in the Supabase dashboard
4. Configure Supabase authentication if needed
5. Create your API routes in `app/api/`
6. Build your UI components in `app/`

## 🤝 Contributing

This is a boilerplate - feel free to customize it for your needs!

## 📄 License

MIT
