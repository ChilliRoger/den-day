# Den Day - Virtual Birthday Party Platform

A dynamic Next.js application for hosting virtual birthday celebrations with video calls, real-time chat, and interactive cake cutting simulations.

## Features

- 🎉 **Create Party**: Host a virtual birthday party and get a unique room code
- 👥 **Join Party**: Join existing parties using a room code
- 📹 **Video Calls**: Dynamic video grid that automatically adjusts based on participant count
- 💬 **Real-time Chat**: Send messages and celebrate together
- 🎂 **Virtual Cake Cutting**: Interactive cake cutting simulation with animations
- 🎨 **Beautiful UI**: Modern, responsive design using shadcn/ui components
- ⚡ **Dynamic Layout**: Video grid automatically reorganizes based on number of participants

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
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
4. Share this code with participants

### Joining a Party

1. Click "Join Existing Party" on the homepage
2. Enter the room code shared by the host
3. Enter your name to join the celebration

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

- [ ] Socket.io integration for real-time synchronization
- [ ] Screen sharing capability
- [ ] Virtual backgrounds
- [ ] Recording functionality
- [ ] Multiple party themes
- [ ] Gift animations
- [ ] Background music
- [ ] Photo booth mode

## License

MIT

## Author

Built with ❤️ for virtual celebrations
