# KIRUTHIS PARLOUR Vite App

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer
- A browser with JavaScript enabled
- Optional: a Razorpay account and API credentials for online payments
- A MongoDB Atlas connection string in `MONGODB_URI` for persistent cloud data
- A WhatsApp admin number in `VITE_ADMIN_WHATSAPP_NUMBER`

The application uses Vite for the frontend and Express for the API. The frontend is a multi-page Vite app with these pages:

- `/` - customer home page
- `/booking.html` - appointment booking
- `/success.html` - booking confirmation
- `/admin.html` - admin dashboard

## Install

Run these commands from the `src` directory:

```powershell
npm install
```

## Development

Start Vite and the Express API together:

```powershell
npm run dev
```

Open `http://localhost:5173/`.

The Vite development server proxies `/api` requests to Express at `http://localhost:3000`.

Create `src/.env` for local MongoDB use:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=kiruthis_parlour
```

When `MONGODB_URI` is missing, the API uses `backend/data.json` as a local development fallback. On Vercel, add `MONGODB_URI` and `MONGODB_DB` under **Project Settings > Environment Variables**.

## Netlify environment variables

In Netlify, open **Site configuration > Environment variables** and add:

```text
MONGODB_URI=your MongoDB Atlas connection string
MONGODB_DB=kiruthis_parlour
VITE_ADMIN_WHATSAPP_NUMBER=919876543210
```

Use the WhatsApp number in international format with the country code and without `+`, spaces, or dashes. After a booking is saved, the site opens a WhatsApp chat with the appointment details prefilled for the admin.

To start only the API:

```powershell
npm run dev:server
```

Do not run `node backendserver.js`; the correct file is `backend/server.js`.

## Production build

```powershell
npm run build
```

The generated frontend is written to `src/dist`.

## Vercel deployment

The repository-root `vercel.json` is configured for deployments from the repository root. It installs dependencies in `src`, builds the Vite app, serves `src/dist`, and routes `/api/*` to `src/api/index.js`.

```powershell
git add .
git commit -m "prepare vite deployment"
git push origin main
```

In Vercel, leave **Root Directory** empty when using the repository-root configuration. If you set the Root Directory to `src`, use `src/vercel.json` instead.