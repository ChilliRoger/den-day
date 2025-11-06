# Video Call Implementation Guide

## How It Works

The Den Day platform uses **WebRTC** (Web Real-Time Communication) for peer-to-peer video calling. Here's how the system works:

### Architecture Overview

```
┌─────────────┐         ┌─────────────┐
│   User A    │         │   User B    │
│  (Browser)  │         │  (Browser)  │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │   1. Join Signal      │
       │──────────────────────>│
       │                       │
       │   2. Offer Signal     │
       │──────────────────────>│
       │                       │
       │   3. Answer Signal    │
       │<──────────────────────│
       │                       │
       │   4. ICE Candidates   │
       │<─────────────────────>│
       │                       │
       │   5. Direct P2P Video │
       │<═════════════════════>│
       │      (WebRTC)         │
```

### Key Components

#### 1. **WebRTC Service** (`lib/webrtc.ts`)
- Manages peer connections using SimplePeer
- Handles local media stream (camera/microphone)
- Creates and manages peer-to-peer connections
- Provides audio/video toggle controls

#### 2. **Signaling Service** (`lib/signaling.ts`)
- Handles peer discovery and connection setup
- Currently uses localStorage for demo purposes
- Enables exchange of:
  - Join announcements
  - WebRTC offers
  - WebRTC answers
  - ICE candidates

#### 3. **Party Store** (`store/partyStore.ts`)
- Zustand state management for participants
- Tracks media streams for each participant
- Manages participant list dynamically

#### 4. **Video Grid Component** (`components/party/VideoGrid.tsx`)
- Dynamically renders video elements
- Auto-adjusts grid layout based on participant count
- Displays video streams from all peers

### Connection Flow

1. **User joins party**
   - Requests camera/microphone access
   - Gets local media stream
   - Sends "join" signal to room

2. **Existing peers respond**
   - Each existing peer creates a peer connection
   - Sends WebRTC offer to new peer

3. **New peer accepts**
   - Creates peer connections for each offer
   - Sends WebRTC answer back

4. **ICE candidates exchange**
   - Both peers exchange network information
   - NAT traversal is attempted using STUN servers

5. **Direct connection established**
   - Peer-to-peer connection is created
   - Video/audio streams directly between browsers
   - No media data passes through server

### Testing Locally

#### Single Device Testing

To test with multiple participants on one computer:

1. **Tab 1**: Create party → Get room code
2. **Tab 2 (Incognito)**: Join with room code
3. Both tabs will connect via WebRTC

**Why Incognito?** Regular tabs share localStorage, but incognito tabs have separate storage, simulating different users.

#### Network Testing

For testing across devices on the same network:

1. The current implementation uses localStorage which only works locally
2. To test across devices, you need to:
   - Implement a WebSocket/Socket.io server for signaling
   - Replace the localStorage signaling with socket messages
   - Deploy the signaling server

### Current Limitations

#### LocalStorage Signaling
- ✅ Works: Same browser, multiple tabs
- ✅ Works: Incognito/private mode testing
- ❌ Doesn't work: Different computers
- ❌ Doesn't work: Different networks

#### Why Use LocalStorage?
- Simple demo implementation
- No backend server required for local testing
- Easy to understand the concepts
- Can be replaced with WebSocket easily

### Upgrading to Production

To make this work across different devices, replace the signaling service:

#### Option 1: Socket.io

```typescript
// server.js
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('join-room', (roomCode, userId, userName) => {
    socket.join(roomCode);
    socket.to(roomCode).emit('user-joined', userId, userName);
  });

  socket.on('signal', (roomCode, userId, data) => {
    socket.to(roomCode).emit('signal', userId, data);
  });
});
```

#### Option 2: WebSocket

```typescript
// Simple WebSocket server
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    // Broadcast to room members
    broadcastToRoom(data.roomCode, data);
  });
});
```

### STUN/TURN Servers

The implementation uses free Google STUN servers:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

For production, consider:
- **STUN**: For NAT traversal (usually free)
- **TURN**: For relay when direct connection fails (usually paid)
  - Twilio
  - Xirsys
  - CoTURN (self-hosted)

### Browser Compatibility

WebRTC is supported in:
- ✅ Chrome/Edge (version 23+)
- ✅ Firefox (version 22+)
- ✅ Safari (version 11+)
- ✅ Opera (version 18+)
- ✅ Mobile browsers (iOS Safari 11+, Chrome Android)

### Security Considerations

1. **HTTPS Required**: WebRTC requires secure context (HTTPS) in production
2. **Permissions**: Users must grant camera/microphone access
3. **Privacy**: Peer-to-peer means no server sees the media
4. **Room Codes**: 6-character codes provide basic security

### Performance Tips

1. **Limit participants**: WebRTC mesh networks work best with 4-8 participants
2. **Video quality**: Adjust resolution based on participant count
3. **Network**: Requires stable internet connection
4. **CPU**: Encoding/decoding video is CPU-intensive

### Debugging

Enable verbose logging:

```typescript
// In webrtc.ts
const peer = new SimplePeer({
  initiator,
  stream: this.localStream || undefined,
  trickle: true,
  debug: true // Enable debug logs
});
```

Check browser console for:
- ICE connection states
- Signaling messages
- Media stream tracks
- Peer connection errors

### Next Steps

To make this production-ready:

1. ✅ Implement WebSocket signaling server
2. ✅ Add TURN server fallback
3. ✅ Handle reconnection scenarios
4. ✅ Add connection quality indicators
5. ✅ Implement SFU for larger groups (10+ participants)
6. ✅ Add recording functionality
7. ✅ Implement waiting room
8. ✅ Add moderator controls

## Resources

- [WebRTC Documentation](https://webrtc.org/)
- [SimplePeer Library](https://github.com/feross/simple-peer)
- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
