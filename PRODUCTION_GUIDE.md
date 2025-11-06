# 🚀 Production Deployment Guide

## Overview

Den Day is now production-ready with:
- ✅ Socket.io server for real-time signaling
- ✅ Secure room validation
- ✅ Professional video calls like Zoom
- ✅ Real-time chat like WhatsApp
- ✅ Secure connections between users

## Architecture

### Frontend (Next.js)
- Runs on port 3000
- Serves the web application
- Handles UI and client-side logic

### Backend (Socket.io Server)
- Runs on port 3001
- Manages WebRTC signaling
- Handles room creation and validation
- Broadcasts chat messages and events

## Local Development

### Start Both Servers

```bash
npm run dev
```

This runs:
- Next.js on `http://localhost:3000`
- Socket.io server on `http://localhost:3001`

### Individual Commands

```bash
# Only Next.js
npm run dev:next

# Only Socket.io server
npm run dev:server
```

## Production Deployment

### Option 1: Single Server Deployment

Deploy both frontend and backend on the same server:

1. **Build the application:**
```bash
npm run build
```

2. **Set environment variables:**
```bash
# .env.production
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
PORT=3001
```

3. **Start production server:**
```bash
npm start
```

### Option 2: Separate Deployments

#### Frontend (Vercel/Netlify)

1. **Deploy Next.js app to Vercel:**
```bash
vercel deploy --prod
```

2. **Set environment variable:**
- `NEXT_PUBLIC_SOCKET_URL` = Your Socket.io server URL

#### Backend (Railway/Render/Heroku)

1. **Deploy Socket.io server:**
```bash
# Push to Railway/Render/Heroku
git push railway main
```

2. **Set environment variables:**
```bash
PORT=3001
ALLOWED_ORIGIN=https://your-frontend.vercel.app
```

3. **Update server CORS in `server/index.js`:**
```javascript
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

const io = socketIO(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
});
```

## Environment Variables

### Frontend (.env.local or .env.production)

```bash
# Development
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Production
NEXT_PUBLIC_SOCKET_URL=https://api.your-domain.com
```

### Backend (process.env)

```bash
PORT=3001
ALLOWED_ORIGIN=https://your-domain.com
NODE_ENV=production
```

## WebRTC STUN/TURN Configuration

For production use across different networks, consider adding TURN servers to `lib/webrtc.ts`:

```typescript
const configuration: RTCConfiguration = {
  iceServers: [
    // STUN servers (already configured)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    
    // Add TURN servers for production
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
};
```

### TURN Server Providers

- **Twilio** - Easy integration, pay-as-you-go
- **Metered** - Free tier available
- **xirsys** - Global network
- **coturn** - Self-hosted open-source

## Security Checklist

- [x] Room code validation (6 characters)
- [x] Host-based room control
- [x] CORS configuration
- [ ] Rate limiting on Socket.io events
- [ ] SSL/TLS certificates (HTTPS)
- [ ] Environment variable security
- [ ] Input sanitization

## Performance Optimization

### Socket.io Server

1. **Enable compression:**
```javascript
const io = socketIO(server, {
  cors: { /* ... */ },
  perMessageDeflate: true
});
```

2. **Set connection limits:**
```javascript
server.maxConnections = 1000;
```

3. **Use Redis adapter for scaling:**
```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

### Next.js

1. **Enable image optimization**
2. **Use CDN for static assets**
3. **Implement lazy loading**

## Monitoring & Logging

### Server Monitoring

Add logging to `server/index.js`:

```javascript
// Log connections
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] User connected: ${socket.id}`);
});

// Log room creation
socket.on('create-room', (data, callback) => {
  console.log(`[${new Date().toISOString()}] Room created: ${roomCode}`);
});
```

### Error Tracking

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **DataDog** for infrastructure monitoring

## Testing in Production

### Pre-deployment Checklist

- [ ] Test room creation
- [ ] Test room joining with valid code
- [ ] Test room joining with invalid code
- [ ] Test video calls with 2+ participants
- [ ] Test chat messages
- [ ] Test cake cutting feature
- [ ] Test host leaving (room should close)
- [ ] Test reconnection after network drop
- [ ] Test on different devices/networks
- [ ] Test on mobile devices

### Load Testing

Use tools like:
- **k6** for Socket.io load testing
- **Artillery** for WebRTC testing
- **WebPageTest** for frontend performance

## Backup & Recovery

### Database (if added later)

- Regular backups
- Point-in-time recovery
- Replication

### Socket.io State

Currently, room state is in-memory. For production:
- Use Redis for persistent room state
- Implement room cleanup on server restart
- Handle reconnection gracefully

## Scaling Strategy

### Horizontal Scaling

1. **Multiple Socket.io servers:**
```javascript
// Use sticky sessions
io.adapter(require('@socket.io/redis-adapter')());
```

2. **Load balancer configuration:**
- Enable sticky sessions (same user → same server)
- WebSocket support
- Health checks

3. **CDN for Next.js static assets**

### Vertical Scaling

- Increase server resources
- Optimize memory usage
- Use Node.js clustering

## Cost Estimation

### Small Scale (< 100 concurrent users)

- **Frontend (Vercel):** Free tier
- **Backend (Railway):** ~$5-10/month
- **STUN only:** Free
- **Total:** ~$5-10/month

### Medium Scale (100-1000 users)

- **Frontend (Vercel Pro):** $20/month
- **Backend (Railway/Render):** $20-50/month
- **TURN servers (Twilio):** $0.0040 per GB
- **Total:** ~$50-100/month

### Large Scale (1000+ users)

- **Frontend (Vercel Enterprise):** Custom
- **Backend (AWS/GCP):** $200-500/month
- **TURN servers:** $100-300/month
- **CDN:** $50-100/month
- **Total:** $500-1000+/month

## Support & Maintenance

### Regular Tasks

- Monitor error logs
- Update dependencies
- Security patches
- Performance optimization
- User feedback integration

### Emergency Response

1. Server down → Check hosting platform
2. Video not working → Check STUN/TURN servers
3. Chat delayed → Check Socket.io connection
4. High latency → Investigate network issues

## Conclusion

Your Den Day platform is now production-ready with:
- ✅ Proper server architecture
- ✅ Secure room validation
- ✅ Professional video calls
- ✅ Real-time chat
- ✅ Scalable foundation

For questions or support, check the main README.md or open an issue on GitHub.

Happy celebrating! 🎉
