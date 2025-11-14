# Setup Instructions

## Database Integration with Neon

Your app now saves all visitor data to Neon PostgreSQL database before sending to Telegram.

### Setup Steps:

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your credentials**:
   - Add your Telegram bot token and chat ID
   - The Neon database URL is already configured
   - Keep `VITE_API_URL=http://localhost:3001` for local development

3. **Run the application**:
   ```bash
   # Option 1: Run frontend and backend together
   pnpm dev:all

   # Option 2: Run separately in different terminals
   # Terminal 1 (Backend API):
   pnpm server

   # Terminal 2 (Frontend):
   pnpm dev
   ```

### What happens when someone visits:

1. Browser collects all fingerprint data
2. Data is saved to Neon PostgreSQL database
3. Summary message + JSON file sent to your Telegram
4. All data is permanently stored in the database

### Database Schema:

The `visitors` table stores:
- Unique visitor ID (fingerprint)
- IP & geolocation (city, country, coordinates, ISP)
- Device info (screen, GPU, CPU, memory, battery)
- Browser details (user agent, vendor, fonts, plugins)
- Fingerprints (canvas, audio, WebRTC)
- Connection info
- Traffic source (URL, referrer)
- All FingerprintJS components
- Timestamp

### API Endpoints:

- `POST /api/visitor` - Save visitor data
- `GET /api/visitors` - Get last 100 visitors

### Production Deployment:

When deploying to production:
1. Deploy the Express server (e.g., Railway, Render, Heroku)
2. Update `VITE_API_URL` in `.env` to your deployed API URL
3. Build the frontend: `pnpm build`
4. Deploy the `dist` folder to your hosting (Vercel, Netlify, etc.)
