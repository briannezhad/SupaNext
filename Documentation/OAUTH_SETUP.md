# OAuth Provider Setup Guide

This guide explains how to configure OAuth providers (Google, X/Twitter, LinkedIn) for authentication in your SupaNext application.

## Overview

The boilerplate supports OAuth authentication through three providers:
- **Google** - Sign in with Google
- **X (Twitter)** - Sign in with X (formerly Twitter)
- **LinkedIn** - Sign in with LinkedIn

## Configuration Steps

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Google OAuth
GOTRUE_EXTERNAL_GOOGLE_ENABLED=true
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
GOTRUE_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI=http://localhost:8000/auth/v1/callback

# Twitter/X OAuth
GOTRUE_EXTERNAL_TWITTER_ENABLED=true
GOTRUE_EXTERNAL_TWITTER_CLIENT_ID=your_twitter_client_id
GOTRUE_EXTERNAL_TWITTER_SECRET=your_twitter_client_secret
GOTRUE_EXTERNAL_TWITTER_REDIRECT_URI=http://localhost:8000/auth/v1/callback

# LinkedIn OAuth
GOTRUE_EXTERNAL_LINKEDIN_ENABLED=true
GOTRUE_EXTERNAL_LINKEDIN_CLIENT_ID=your_linkedin_client_id
GOTRUE_EXTERNAL_LINKEDIN_SECRET=your_linkedin_client_secret
GOTRUE_EXTERNAL_LINKEDIN_REDIRECT_URI=http://localhost:8000/auth/v1/callback
```

**Note**: For production, update the redirect URIs to use your production domain.

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or **Google Identity Services**)
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - Development: `http://localhost:8000/auth/v1/callback`
   - Production: `https://yourdomain.com/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**
8. Add them to your `.env` file

### 3. X (Twitter) OAuth Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app or select an existing one
3. Go to **Settings** → **User authentication settings**
4. Enable **OAuth 1.0a** or **OAuth 2.0**
5. Set callback URL:
   - Development: `http://localhost:8000/auth/v1/callback`
   - Production: `https://yourdomain.com/auth/v1/callback`
6. Set app permissions (Read, Write, or Read and Write)
7. Copy the **API Key** (Client ID) and **API Secret Key** (Client Secret)
8. Add them to your `.env` file

**Note**: Twitter uses OAuth 2.0 for new apps. Make sure to use the correct authentication method.

### 4. LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Go to **Auth** tab
4. Add redirect URLs:
   - Development: `http://localhost:8000/auth/v1/callback`
   - Production: `https://yourdomain.com/auth/v1/callback`
5. Request the following OAuth 2.0 scopes:
   - `openid`
   - `profile`
   - `email`
6. Copy the **Client ID** and **Client Secret**
7. Add them to your `.env` file

### 5. Restart Services

After adding the environment variables, restart your Docker services:

```bash
docker compose down
docker compose up -d
```

Or restart just the auth service:

```bash
docker compose restart auth
```

## Testing OAuth

1. Navigate to the login or signup page
2. Click on one of the OAuth provider buttons (Google, X, or LinkedIn)
3. You should be redirected to the provider's login page
4. After authentication, you'll be redirected back to your application
5. You should be logged in and redirected to the dashboard

## Troubleshooting

### OAuth buttons not showing

- Make sure the provider is enabled in your `.env` file (`GOTRUE_EXTERNAL_*_ENABLED=true`)
- Verify that the Client ID and Secret are set
- Check the browser console for errors

### Redirect URI mismatch

- Ensure the redirect URI in your OAuth provider settings matches exactly:
  - Development: `http://localhost:8000/auth/v1/callback`
  - Production: `https://yourdomain.com/auth/v1/callback`
- The redirect URI must match what's configured in the OAuth provider's dashboard

### Authentication fails

- Check the auth service logs: `docker compose logs -f auth`
- Verify that all environment variables are set correctly
- Ensure the OAuth provider credentials are valid
- Check that the redirect URI is whitelisted in the OAuth provider settings

### Session not established after OAuth

- The callback route should handle the OAuth code exchange automatically
- Check the browser's network tab to see if the callback is being called
- Verify that cookies are being set correctly

## Production Considerations

1. **HTTPS Required**: OAuth providers require HTTPS in production
2. **Redirect URIs**: Update all redirect URIs to use your production domain
3. **Environment Variables**: Use secure secret management (not plain `.env` files)
4. **Error Handling**: The callback route handles OAuth errors and redirects to login with error messages

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Twitter OAuth Documentation](https://developer.twitter.com/en/docs/authentication/overview)
- [LinkedIn OAuth Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)

