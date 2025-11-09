# Routing Control Center

A centralized routing system for managing all application routes, authentication requirements, and navigation logic.

## Overview

The Routing Control Center provides:
- **Centralized route definitions** - All routes in one place
- **Route metadata** - Labels, titles, descriptions, and access requirements
- **Automatic redirects** - Based on authentication state
- **Type-safe navigation** - TypeScript support for all routes
- **Navigation utilities** - Hooks and helpers for client-side navigation

## Structure

```
lib/routes/
├── config.ts      # Route definitions and configuration
├── navigation.ts  # Navigation hooks and utilities
├── index.ts       # Main exports
└── README.md      # This file
```

## Usage

### Basic Route Access

```typescript
import { ROUTES } from '@/lib/routes'

// Use routes in components
<Link href={ROUTES.DASHBOARD}>Dashboard</Link>
router.push(ROUTES.LOGIN)
```

### Route Configuration

Each route has a configuration object:

```typescript
{
  path: '/dashboard',
  label: 'Dashboard',
  requiresAuth: true,
  redirectTo: '/login',
  meta: {
    title: 'Dashboard',
    description: 'User dashboard',
  }
}
```

### Navigation Hooks

#### `useAuthNavigation()`

Hook for navigation with automatic auth checks:

```typescript
import { useAuthNavigation } from '@/lib/routes'

function MyComponent() {
  const { navigate, isAuthenticated } = useAuthNavigation()
  
  const handleClick = () => {
    // Automatically redirects to login if not authenticated
    navigate(ROUTES.DASHBOARD)
  }
  
  return <button onClick={handleClick}>Go to Dashboard</button>
}
```

#### `useNavigation()`

Simple navigation helper without auth checks:

```typescript
import { useNavigation } from '@/lib/routes'

function MyComponent() {
  const { goTo, goBack } = useNavigation()
  
  return (
    <>
      <button onClick={() => goTo(ROUTES.HOME)}>Home</button>
      <button onClick={goBack}>Back</button>
    </>
  )
}
```

#### `useRouteMetadata()`

Get metadata for the current route:

```typescript
import { useRouteMetadata } from '@/lib/routes'

function MyComponent() {
  const { title, description, label } = useRouteMetadata()
  
  return (
    <>
      <h1>{title}</h1>
      <p>{description}</p>
    </>
  )
}
```

### Route Utilities

```typescript
import { 
  requiresAuth, 
  requiresGuest, 
  getRedirectPath,
  getProtectedRoutes,
  getPublicRoutes 
} from '@/lib/routes'

// Check if route requires authentication
if (requiresAuth('/dashboard')) {
  // ...
}

// Get redirect path based on auth state
const redirect = getRedirectPath('/dashboard', isAuthenticated)
// Returns '/login' if not authenticated, null if accessible

// Get all protected/public routes
const protected = getProtectedRoutes()
const public = getPublicRoutes()
```

## Adding New Routes

1. Add the route constant in `config.ts`:

```typescript
export const ROUTES = {
  // ... existing routes
  PROFILE: '/profile',
} as const
```

2. Add route configuration:

```typescript
export const ROUTE_CONFIG: Record<Route, RouteConfig> = {
  // ... existing configs
  [ROUTES.PROFILE]: {
    path: ROUTES.PROFILE,
    label: 'Profile',
    requiresAuth: true,
    redirectTo: ROUTES.LOGIN,
    meta: {
      title: 'User Profile',
      description: 'Manage your profile settings',
    },
  },
}
```

3. Use the route in your components:

```typescript
<Link href={ROUTES.PROFILE}>Profile</Link>
```

## Middleware Integration

The middleware automatically uses the routing config:

```typescript
// middleware.ts
import { getRedirectPath, ROUTES } from '@/lib/routes'

const redirectPath = getRedirectPath(pathname, isAuthenticated)
if (redirectPath) {
  // Redirect user
}
```

## Best Practices

1. **Always use `ROUTES` constants** - Never hardcode route paths
2. **Use navigation hooks** - For client-side navigation with auth checks
3. **Update config first** - When adding routes, update the config before using them
4. **Type safety** - Use the `Route` type for route parameters

## Route Types

- **Public Routes**: Accessible to everyone (`requiresAuth: false`)
- **Protected Routes**: Require authentication (`requiresAuth: true`)
- **Guest Routes**: Redirect authenticated users away (`requiresGuest: true`)

## Examples

### Protected Route Component

```typescript
'use client'

import { useAuthNavigation, ROUTES } from '@/lib/routes'

export function ProtectedComponent() {
  const { navigate, isAuthenticated } = useAuthNavigation()
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN)
    }
  }, [isAuthenticated, navigate])
  
  // Component content
}
```

### Conditional Navigation

```typescript
import { useAuthNavigation, ROUTES } from '@/lib/routes'

function MyComponent() {
  const { navigate, isAuthenticated } = useAuthNavigation()
  
  const handleAction = () => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD)
    } else {
      navigate(ROUTES.LOGIN)
    }
  }
}
```

