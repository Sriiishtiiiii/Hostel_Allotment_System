# Clerk Authentication Setup Guide

## 📋 Prerequisites

1. Create a Clerk account at [https://clerk.com](https://clerk.com)
2. Create a new application in Clerk Dashboard

## 🔑 Step 1: Get Your Clerk Keys

1. Go to **Clerk Dashboard** → **API Keys**
2. Copy your:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## 🎯 Step 2: Update Environment Variables

### Frontend (.env.local)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

## 👥 Step 3: Configure User Roles in Clerk

In Clerk Dashboard → **User & Authentication** → **Metadata**:

Add public metadata for each user:
```json
{
  "role": "student"
}
```
or
```json
{
  "role": "admin"
}
```

## 🗄️ Step 4: Sync Clerk Users to Database (Optional)

Run this script to link Clerk users with your Student/Admin tables:

```bash
cd Server
npx tsx src/scripts/sync-clerk-users.ts
```

## 🚀 Step 5: Start the Application

### Terminal 1 - Backend:
```bash
cd Server
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd Client
npm run dev
```

## 🔐 How It Works

1. **User signs up/logs in** via Clerk (frontend)
2. **Clerk returns a JWT token** automatically
3. **Frontend sends token** in Authorization header
4. **Backend verifies token** with Clerk API
5. **User's Clerk ID** is used to identify them in your database

## 🎨 Features You Get with Clerk

✅ Pre-built UI components for login/signup
✅ Email verification
✅ Password reset
✅ Social logins (Google, GitHub, etc.)
✅ Two-factor authentication
✅ Session management
✅ User profiles

## 📝 Customizing Sign-In/Sign-Up

Edit the Clerk appearance in `Client/src/pages/ClerkLogin.tsx` or via Clerk Dashboard → **Customization**.

## 🔗 Important URLs

- Sign In: `http://localhost:5173/login`
- Sign Up: `http://localhost:5173/signup`
- Clerk Dashboard: `https://dashboard.clerk.com`

## 🛠️ Troubleshooting

**Issue:** "Missing Clerk Publishable Key"
- **Fix:** Add `VITE_CLERK_PUBLISHABLE_KEY` to `Client/.env.local`

**Issue:** Backend returns 401 Unauthorized
- **Fix:** Ensure `CLERK_SECRET_KEY` is set in `Server/.env`

**Issue:** Role not detected
- **Fix:** Add `{"role": "student"}` or `{"role": "admin"}` in user's public metadata in Clerk Dashboard
