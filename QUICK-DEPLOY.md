# Quick Deploy Guide for Den Day

## Step 1: Deploy Socket.io Server to Railway

Railway is the easiest option for deploying the WebSocket server.

1. **Install Railway CLI:**
   ```powershell
   npm i -g @railway/cli
   ```

2. **Login to Railway:**
   ```powershell
   railway login
   ```

3. **Initialize and deploy:**
   ```powershell
   railway init
   railway up
   ```

4. **Get your Railway URL:**
   - Go to Railway dashboard
   - Click on your service
   - Copy the public URL (e.g., `https://den-day-production.up.railway.app`)

## Step 2: Deploy Frontend to Vercel

1. **Login to Vercel:**
   ```powershell
   vercel login
   ```

2. **Deploy to production:**
   ```powershell
   vercel --prod
   ```

3. **Add environment variable:**
   When prompted or in Vercel dashboard, add:
   - Variable: `NEXT_PUBLIC_SOCKET_URL`
   - Value: Your Railway URL from Step 1

4. **Set custom domain (optional):**
   ```powershell
   vercel domains add den-day
   ```

## That's it! 🎉

Your app will be live at:
- Vercel: `https://den-day.vercel.app` (or your custom domain)
- Socket Server: Your Railway URL

## Testing

1. Open your Vercel URL
2. Create a party
3. Open incognito/private window
4. Join the party with room code
5. Test video, audio, and chat!

## Troubleshooting

**Connection issues:**
- Verify `NEXT_PUBLIC_SOCKET_URL` in Vercel settings
- Check Railway logs: `railway logs`
- Check Vercel logs: `vercel logs`

**CORS errors:**
- Make sure your Vercel URL is added to server CORS config
- Redeploy Railway: `railway up`
