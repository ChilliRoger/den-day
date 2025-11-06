# Den Day - Virtual Birthday Party Platform

A production-ready Next.js application for hosting virtual birthday celebrations with real-time video calls, live chat, and interactive features.

## Overview

Den Day is a web-based platform that enables users to host and join virtual birthday parties. Built with modern web technologies, it provides a seamless video conferencing experience with real-time communication capabilities.

## Features

### Core Functionality
- **Party Management**: Create and join virtual parties using unique 6-character room codes
- **Video Conferencing**: WebRTC-powered peer-to-peer video streaming with multiple participants
- **Real-time Chat**: Instant messaging system with all party participants
- **Interactive Celebrations**: Virtual cake cutting ceremony with animations and confetti effects
- **Media Controls**: Toggle microphone and camera on/off during calls
- **Responsive Design**: Modern UI optimized for desktop and mobile devices
- **Dynamic Grid Layout**: Automatic video layout adjustment based on participant count

### Technical Features
- Server-side signaling with Socket.io for production-grade connectivity
- Secure room validation and management
- Connection status indicators
- Participant tracking and notifications
- Custom scrollbar styling and smooth animations

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: shadcn/ui component library
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend & Communication
- **WebRTC**: SimplePeer for peer-to-peer connections
- **Signaling Server**: Socket.io with Express
- **Real-time Events**: Socket.io for chat and signaling

### Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Environment Management**: Environment variables for configuration

## Live Deployment

- **Application**: https://den-day.vercel.app
- **WebSocket Server**: https://den-day-production.up.railway.app

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Modern web browser with WebRTC support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ChilliRoger/den-day.git
cd den-day
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env.local` file:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the Next.js frontend (port 3000) and Socket.io server (port 3001).

5. Open http://localhost:3000 in your browser

## Usage Guide

### Creating a Party

1. Navigate to the homepage
2. Click "Create New Party"
3. Enter your name as the host
4. Grant camera and microphone permissions when prompted
5. Share the generated room code with participants
6. Use the cake cutting button to start the celebration

### Joining a Party

1. Navigate to the homepage
2. Click "Join Existing Party"
3. Enter the room code provided by the host
4. Enter your name
5. Grant camera and microphone permissions
6. You will be connected to the party room

### Testing Locally

To test multi-user functionality on a single computer:

1. Create a party in a regular browser window
2. Copy the room code
3. Open a new incognito/private window
4. Join the party using the copied room code
5. Grant permissions in both windows

Note: Using incognito mode simulates different users on the same device.

## Project Structure

```
den-day/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles
│   └── party/[roomCode]/
│       └── page.tsx            # Party room
├── components/
│   ├── ui/                     # UI components
│   ├── party/
│   │   ├── VideoGrid.tsx       # Video grid layout
│   │   ├── ChatArea.tsx        # Chat interface
│   │   └── CakeCutting.tsx     # Cake animation
│   └── VideoCallGuide.tsx      # User guide
├── server/
│   └── index.js                # Socket.io server
├── lib/
│   ├── signaling.ts            # Socket.io client
│   ├── webrtc.ts               # WebRTC management
│   └── utils.ts                # Utilities
└── store/
    └── partyStore.ts           # State management
```

## Architecture

### Video Grid System

The video grid dynamically adjusts layout based on participant count:
- 1 participant: Full screen (600px height)
- 2 participants: 2-column grid (400px height)
- 3-4 participants: 2-column grid (300px height)
- 5-6 participants: 3-column grid (250px height)
- 7+ participants: 4-column grid (250px height)

### Communication Flow

1. **Signaling**: Socket.io handles WebRTC signaling (offer/answer/ICE candidates)
2. **Peer Connections**: SimplePeer establishes direct peer-to-peer connections
3. **Media Streams**: Browser MediaDevices API captures audio/video
4. **State Management**: Zustand maintains application state
5. **Real-time Updates**: Socket.io broadcasts events to all participants

## Deployment

### Frontend Deployment (Vercel)

```bash
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SOCKET_URL`: Your Socket.io server URL

### Backend Deployment (Railway)

```bash
railway up
```

Set environment variables in Railway dashboard:
- `NEXT_PUBLIC_APP_URL`: Your Vercel domain
- `PORT`: 8080 (or Railway's assigned port)

## API Endpoints

### Socket.io Events

**Client to Server:**
- `create-room`: Create a new party room
- `join-room`: Join an existing room
- `offer`: Send WebRTC offer
- `answer`: Send WebRTC answer
- `ice-candidate`: Send ICE candidate
- `chat-message`: Send chat message
- `start-cake-cutting`: Initiate cake cutting

**Server to Client:**
- `room-created`: Room creation confirmation
- `room-joined`: Room join confirmation
- `user-joined`: New participant notification
- `user-left`: Participant left notification
- `offer`: Receive WebRTC offer
- `answer`: Receive WebRTC answer
- `ice-candidate`: Receive ICE candidate
- `chat-message`: Receive chat message
- `cake-cutting-started`: Cake cutting initiated
- `room-closed`: Room closure notification

### HTTP Endpoints

- `GET /health`: Server health check
- `GET /room/:roomCode`: Room status information

## Configuration

### Environment Variables

**Frontend (.env.local / .env.production):**
- `NEXT_PUBLIC_APP_URL`: Application URL
- `NEXT_PUBLIC_SOCKET_URL`: Socket.io server URL

**Backend:**
- `PORT`: Server port (default: 3001)
- `NEXT_PUBLIC_APP_URL`: Allowed origin for CORS

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

WebRTC and MediaDevices API support required.

## Performance

- Peer-to-peer connections minimize server load
- Dynamic grid layout optimizes rendering
- Efficient state management with Zustand
- Lazy loading of components
- Optimized WebRTC configurations with STUN servers

## Security

- Room code validation (6-character alphanumeric)
- CORS configuration for allowed origins
- Secure WebSocket connections (wss://)
- Environment variable management
- No persistent storage of media streams

## Troubleshooting

### Connection Issues
- Verify Socket.io server is running
- Check environment variables are correctly set
- Ensure firewall allows WebRTC connections
- Review browser console for errors

### Video/Audio Problems
- Grant camera and microphone permissions
- Check device settings in browser
- Test with browser's built-in media test
- Verify no other application is using the devices

### Chat Not Working
- Confirm Socket.io connection is established
- Check network connectivity
- Review server logs for errors

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Next.js team for the framework
- shadcn/ui for component library
- SimplePeer for WebRTC abstraction
- Socket.io for real-time communication

## Support

For issues and feature requests, please use the GitHub issue tracker.

## Version History

- 1.0.0: Initial production release
  - WebRTC video conferencing
  - Real-time chat
  - Virtual cake cutting
  - Socket.io signaling server
  - Production deployment
