# Vercel Deployment Instructions for Den Day

## Important: Two-Part Deployment

This project requires **two separate deployments**:

1. **Frontend (Next.js)** → Deploy to Vercel
2. **Socket.io Server** → Deploy to a service that supports WebSockets (Railway, Render, or Heroku)

## Part 1: Deploy Socket.io Server

### Option A: Deploy to Railway (Recommended)

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Create a new project:
   ```bash
   railway init
   ```

4. Create a `Procfile` in the root:
   ```
   web: node server/index.js
   ```

5. Deploy:
   ```bash
   railway up
   ```

6. Get your Railway URL from the dashboard (e.g., `https://your-app.up.railway.app`)

### Option B: Deploy to Render

1. Push your code to GitHub
2. Go to https://render.com
3. Create a new "Web Service"
4. Connect your GitHub repo
5. Set:
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
   - Port: 3001
6. Deploy and get your Render URL

## Part 2: Deploy Frontend to Vercel

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Set the environment variable for your Socket.io server:
   ```bash
   vercel env add NEXT_PUBLIC_SOCKET_URL production
   ```
   Enter your Railway/Render URL (e.g., `https://your-app.up.railway.app`)

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

4. Set your custom domain:
   ```bash
   vercel domains add den-day.vercel.app
   ```

## Environment Variables

Make sure to set these in Vercel dashboard:
- `NEXT_PUBLIC_SOCKET_URL`: Your Socket.io server URL (from Railway/Render)
- `NEXT_PUBLIC_APP_URL`: Your Vercel domain (https://den-day.vercel.app)

## Testing After Deployment

1. Visit your Vercel URL
2. Create a party
3. Open incognito window and join
4. Test video, audio, and chat features

## Custom Domain Setup

To use `den-day` as your domain:

1. If you own `den-day.com`:
   ```bash
   vercel domains add den-day.com
   ```
   Then add the DNS records shown by Vercel

2. For Vercel subdomain:
   ```bash
   vercel alias set your-deployment-url den-day
   ```

## Troubleshooting

- If video doesn't work: Check CORS settings in server/index.js
- If connection fails: Verify NEXT_PUBLIC_SOCKET_URL is correct
- Check logs: `vercel logs` and Railway/Render logs
