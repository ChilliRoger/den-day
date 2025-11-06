# Den Day - Virtual Birthday Party Platform

A dynamic Next.js application for hosting virtual birthday celebrations with video calls, real-time chat, and interactive cake cutting simulations.

## Features

- 🎉 **Create Party**: Host a virtual birthday party and get a unique room code
- 👥 **Join Party**: Join existing parties using a room code
- 📹 **Real Video Calls**: WebRTC-powered peer-to-peer video streaming
- 💬 **Real-time Chat**: Send messages and celebrate together
- 🎂 **Virtual Cake Cutting**: Interactive cake cutting simulation with animations
- 🎨 **Beautiful UI**: Modern, responsive design using shadcn/ui components
- ⚡ **Dynamic Layout**: Video grid automatically reorganizes based on number of participants
- 🔇 **Audio/Video Controls**: Toggle your microphone and camera on/off
- 🎯 **Peer-to-Peer**: Direct WebRTC connections between participants

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Video/Audio**: WebRTC with SimplePeer
- **Signaling**: localStorage (for local testing) - easily replaceable with WebSocket/Socket.io
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Party

1. Click "Create New Party" on the homepage
2. Enter your name (as host) and the birthday person's name
3. You'll receive a unique 6-character room code
4. **Allow camera and microphone permissions when prompted**
5. Share this code with participants

### Joining a Party

1. Click "Join Existing Party" on the homepage
2. Enter the room code shared by the host
3. Enter your name to join the celebration
4. **Allow camera and microphone permissions when prompted**
5. You'll be connected via video call with other participants

### Testing Video Calls Locally

**Important:** To test the video call feature with multiple participants on the same computer:

1. Open the first browser tab and create a party
2. Copy the room code
3. Open a **second browser tab in incognito/private mode** (or use a different browser)
4. Join the party using the room code
5. Both tabs should now show video feeds from each other

**Note:** The current implementation uses localStorage for signaling (peer discovery). This works for:
- ✅ Multiple tabs in the same browser
- ✅ Same computer testing
- ❌ Different computers/devices (requires WebSocket server)

For production use across different devices, you'll need to implement a WebSocket server for signaling.

### Party Room Features

- **Video Grid**: Automatically adjusts layout based on participant count (1-12+ participants)
- **Chat**: Send messages to all participants
- **Controls**: Toggle microphone and camera on/off
- **Cake Cutting**: Host can initiate the virtual cake cutting ceremony
- **Participant Count**: View real-time count of party attendees

## Project Structure

```
den-day/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage with Create/Join options
│   ├── globals.css          # Global styles
│   └── party/
│       └── [roomCode]/
│           └── page.tsx     # Party room page
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   └── party/               # Party-specific components
│       ├── VideoGrid.tsx    # Dynamic video grid
│       ├── ChatArea.tsx     # Real-time chat
│       └── CakeCutting.tsx  # Cake cutting simulation
├── store/
│   └── partyStore.ts        # Zustand store for party state
└── lib/
    └── utils.ts             # Utility functions
```

## Dynamic Features

### Video Grid Layout

The video grid automatically adjusts based on participant count:
- 1 participant: Full screen (600px height)
- 2 participants: 2 columns (400px height)
- 3-4 participants: 2 columns (300px height)
- 5-6 participants: 3 columns (250px height)
- 7+ participants: 4 columns (250px height)

### Real-time Communication

The application uses:
- WebRTC for peer-to-peer video streaming
- Zustand for state management
- Browser MediaDevices API for camera/microphone access

## Building for Production

```bash
npm run build
npm start
```

## Future Enhancements

- [x] WebRTC video calling
- [ ] Socket.io integration for production signaling (cross-device support)
- [ ] Screen sharing capability
- [ ] Virtual backgrounds
- [ ] Recording functionality
- [ ] Multiple party themes
- [ ] Gift animations
- [ ] Background music
- [ ] Photo booth mode
- [ ] More participants support (12+)
- [ ] Mobile app version

## License

MIT

## Author

Built with ❤️ for virtual celebrations
