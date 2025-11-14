# Deploy to Vercel

## Step-by-Step Deployment Guide

### 1. Prepare Your Repository

Make sure all changes are committed to Git:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings

### 3. Configure Environment Variables

In Vercel Dashboard, go to your project → Settings → Environment Variables

Add these variables:

| Name | Value |
|------|-------|
| `VITE_TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather |
| `VITE_TELEGRAM_CHAT_ID` | Your Telegram chat ID from @userinfobot |
| `VITE_API_URL` | `https://your-project.vercel.app` (your Vercel URL) |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_ute6hrokm7JY@ep-weathered-thunder-adtqbclh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` |

**Important:** After adding environment variables, redeploy your project for them to take effect.

### 4. Update API URL in Code (if needed)

After deployment, update your `.env` file for local development:

```env
VITE_API_URL=https://your-project.vercel.app
```

### 5. Verify Deployment

Once deployed:
1. Visit your Vercel URL
2. Open browser console and check for errors
3. The visitor data should be saved to Neon database
4. You should receive a Telegram notification

### 6. Test the API

Check if your API is working:
- `https://your-project.vercel.app/api/visitor` (POST - save visitor)
- `https://your-project.vercel.app/api/visitor` (GET - view visitors)

## How It Works on Vercel

- **Frontend**: Vite builds your React app → Static files served by Vercel
- **Backend**: `api/visitor.js` runs as serverless function on Vercel
- **Database**: Neon PostgreSQL (same database, serverless-friendly)
- **API Endpoint**: `/api/visitor` automatically routed to your function

## Troubleshooting

### Issue: API not working
- Check Environment Variables are set correctly
- Redeploy after adding env vars
- Check Vercel Function logs in Dashboard

### Issue: Database connection fails
- Verify DATABASE_URL is correct
- Ensure SSL mode is enabled in connection string
- Check Neon database is active

### Issue: CORS errors
- The serverless function includes CORS headers
- Make sure VITE_API_URL points to your Vercel domain

## Project Structure on Vercel

```
doakes/
├── api/              # Serverless functions (becomes /api/* endpoints)
│   └── visitor.js    # POST/GET /api/visitor
├── src/              # React app (builds to static files)
├── public/           # Static assets
└── vercel.json       # Vercel configuration
```

## Local Development vs Production

**Local:**
- Express server on `localhost:3001`
- Vite dev server on `localhost:5173`
- Run: `pnpm dev:all`

**Production (Vercel):**
- Serverless functions at `https://your-project.vercel.app/api/*`
- Static frontend at `https://your-project.vercel.app`
- Auto-deploys on git push
