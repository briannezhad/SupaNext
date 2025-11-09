# Email Configuration Guide

## Problem: "Error sending confirmation email"

This error occurs when Supabase tries to send confirmation emails but SMTP is not configured. You have two options:

## Solution 1: Enable Auto-Confirm (Recommended for Development)

For local development, you can enable auto-confirm so users don't need to verify their email addresses. This bypasses the need for SMTP configuration.

### Steps:

1. **Add to your `.env` file:**
   ```bash
   ENABLE_EMAIL_AUTOCONFIRM=true
   ```

2. **Restart your Docker containers:**
   ```bash
   docker compose down
   docker compose up -d
   ```

3. **That's it!** Users can now sign up without email confirmation.

## Solution 2: Configure SMTP (Required for Production)

For production, you should configure proper SMTP settings to send real emails.

### Steps:

1. **Get SMTP credentials** from your email provider:
   - **Gmail**: Use App Password (not your regular password)
   - **SendGrid**: API key and SMTP settings
   - **Mailgun**: SMTP credentials from dashboard
   - **AWS SES**: SMTP credentials from AWS console
   - **Other providers**: Check their documentation

2. **Add to your `.env` file:**
   ```bash
   # Disable auto-confirm for production
   ENABLE_EMAIL_AUTOCONFIRM=false
   
   # SMTP Configuration
   SMTP_ADMIN_EMAIL=your-email@example.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_SENDER_NAME=Your App Name
   ```

3. **Example for Gmail:**
   ```bash
   ENABLE_EMAIL_AUTOCONFIRM=false
   SMTP_ADMIN_EMAIL=noreply@yourapp.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_SENDER_NAME=My App
   ```

4. **Example for SendGrid:**
   ```bash
   ENABLE_EMAIL_AUTOCONFIRM=false
   SMTP_ADMIN_EMAIL=noreply@yourapp.com
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   SMTP_SENDER_NAME=My App
   ```

5. **Restart your Docker containers:**
   ```bash
   docker compose down
   docker compose up -d
   ```

## Testing Email Configuration

After configuring SMTP, test by:

1. Signing up with a new email address
2. Check your email inbox (and spam folder) for the confirmation email
3. Click the confirmation link to verify the email

## Troubleshooting

### Still getting errors?

1. **Check SMTP credentials** - Make sure they're correct
2. **Check firewall/ports** - Ensure port 587 or 465 is open
3. **Check email provider settings** - Some providers require:
   - App passwords (Gmail)
   - IP whitelisting
   - Domain verification
4. **Check Docker logs:**
   ```bash
   docker compose logs auth
   ```

### For Gmail specifically:

1. Enable 2-factor authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password (not your regular password)

## Environment Variables Reference

| Variable | Description | Default |
|-----------|-------------|---------|
| `ENABLE_EMAIL_AUTOCONFIRM` | Auto-confirm emails (no SMTP needed) | `false` |
| `SMTP_ADMIN_EMAIL` | Admin email address | - |
| `SMTP_HOST` | SMTP server hostname | - |
| `SMTP_PORT` | SMTP server port (587 or 465) | - |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `SMTP_SENDER_NAME` | Display name for emails | - |

## Quick Fix for Development

If you just want to get started quickly, add this to your `.env`:

```bash
ENABLE_EMAIL_AUTOCONFIRM=true
```

Then restart:
```bash
docker compose restart auth
```

Users will be automatically confirmed without needing to check their email.

