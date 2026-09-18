# Parlour Booking

A React + Vite customer booking website with a protected admin dashboard backed by Firebase Authentication and Cloud Firestore.

## Install

Requirements: Node.js 20.19 or newer and npm.

```powershell
npm install
```

## Firebase setup

1. Create a Firebase project at https://console.firebase.google.com.
2. Enable Authentication with the Email/Password provider.
3. Create a Firestore database.
4. Register a Web app in Project settings.
5. Copy `.env.example` to `.env` and fill in the Web app values.

```powershell
Copy-Item .env.example .env
```

Required variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Never commit `.env`, service-account JSON files, private keys, or passwords.

Deploy `src/firestore.rules` from the Firebase console or Firebase CLI:

```powershell
firebase deploy --only firestore:rules
```

Create an account in the app, then set that user's Firestore document at `users/{uid}` to `role: "admin"` to grant admin access. The frontend cannot promote itself because the Firestore rules reject role changes.

## Run locally

```powershell
npm run dev
```

Open http://localhost:5173.

Customer routes include `/`, `/services`, `/booking`, `/login`, `/register`, `/my-bookings`, and `/contact`. Admin routes include `/admin`, `/admin/bookings`, `/admin/services`, `/admin/working-hours`, `/admin/holidays`, and `/admin/settings`.

## Build and preview

```powershell
npm run build
npm run preview
```

The production output is generated in `dist/`.

## GitHub

```powershell
git add .
git commit -m "prepare firebase vite app for vercel"
git push origin main
```

## Vercel deployment

Import the GitHub repository in Vercel with these settings:

```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
Root Directory: .
```

Add the six `VITE_FIREBASE_*` variables in Vercel Project Settings for the Production, Preview, and Development environments. Redeploy after changing environment variables because Vite embeds them during the build.

After the first deployment, add the production Vercel hostname to Firebase Console → Authentication → Settings → Authorized domains. Add preview domains too if preview deployments need login.

The root `vercel.json` contains only the React Router SPA rewrite. It has no serverless functions and no runtime declarations.
