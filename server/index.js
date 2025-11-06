const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store active rooms and their participants
const rooms = new Map();

// Room structure:
// {
//   roomCode: {
//     host: userId,
//     hostName: string,
//     birthdayPerson: string,
//     participants: Map<userId, { socketId, userName, isHost }>
//     createdAt: timestamp
//   }
// }

// Helper function to validate room code
function isValidRoomCode(roomCode) {
  return /^[A-Z0-9]{6}$/.test(roomCode);
}

// Helper function to get room info
function getRoomInfo(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  
  return {
    exists: true,
    participantCount: room.participants.size,
    hostName: room.hostName,
    birthdayPerson: room.birthdayPerson,
    participants: Array.from(room.participants.entries()).map(([id, data]) => ({
      userId: id,
      userName: data.userName,
      isHost: data.isHost
    }))
  };
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  let currentRoom = null;
  let currentUserId = null;

  // Create a new party room
  socket.on('create-room', ({ roomCode, userId, userName, hostName, birthdayPerson }) => {
    console.log(`Creating room: ${roomCode} by ${userName}`);
    
    if (!isValidRoomCode(roomCode)) {
      socket.emit('error', { message: 'Invalid room code format' });
      return;
    }

    if (rooms.has(roomCode)) {
      socket.emit('error', { message: 'Room already exists' });
      return;
    }

    // Create new room
    const room = {
      host: userId,
      hostName: hostName || userName,
      birthdayPerson: birthdayPerson || 'Birthday Person',
      participants: new Map(),
      createdAt: Date.now()
    };

    room.participants.set(userId, {
      socketId: socket.id,
      userName,
      isHost: true
    });

    rooms.set(roomCode, room);
    socket.join(roomCode);
    currentRoom = roomCode;
    currentUserId = userId;

    console.log(`Room ${roomCode} created successfully`);
    
    socket.emit('room-created', {
      roomCode,
      roomInfo: getRoomInfo(roomCode)
    });
  });

  // Join an existing room
  socket.on('join-room', ({ roomCode, userId, userName }) => {
    console.log(`${userName} attempting to join room: ${roomCode}`);
    
    if (!isValidRoomCode(roomCode)) {
      socket.emit('error', { message: 'Invalid room code format' });
      return;
    }

    const room = rooms.get(roomCode);
    
    if (!room) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }

    // Check if user is already in the room
    if (room.participants.has(userId)) {
      socket.emit('error', { message: 'You are already in this room' });
      return;
    }

    // Add participant to room
    room.participants.set(userId, {
      socketId: socket.id,
      userName,
      isHost: false
    });

    socket.join(roomCode);
    currentRoom = roomCode;
    currentUserId = userId;

    console.log(`${userName} joined room ${roomCode}`);

    // Notify the user they joined successfully
    socket.emit('room-joined', {
      roomCode,
      roomInfo: getRoomInfo(roomCode)
    });

    // Notify others in the room about new participant
    socket.to(roomCode).emit('user-joined', {
      userId,
      userName,
      participantCount: room.participants.size
    });

    // Send list of existing participants to the new user
    const existingParticipants = Array.from(room.participants.entries())
      .filter(([id]) => id !== userId)
      .map(([id, data]) => ({
        userId: id,
        userName: data.userName,
        isHost: data.isHost
      }));

    socket.emit('existing-participants', { participants: existingParticipants });
  });

  // WebRTC signaling: Send offer
  socket.on('offer', ({ roomCode, targetUserId, offer, fromUserId, fromUserName }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const targetParticipant = room.participants.get(targetUserId);
    if (!targetParticipant) return;

    console.log(`Sending offer from ${fromUserName} to ${targetParticipant.userName}`);

    io.to(targetParticipant.socketId).emit('offer', {
      fromUserId,
      fromUserName,
      offer
    });
  });

  // WebRTC signaling: Send answer
  socket.on('answer', ({ roomCode, targetUserId, answer, fromUserId, fromUserName }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const targetParticipant = room.participants.get(targetUserId);
    if (!targetParticipant) return;

    console.log(`Sending answer from ${fromUserName} to ${targetParticipant.userName}`);

    io.to(targetParticipant.socketId).emit('answer', {
      fromUserId,
      fromUserName,
      answer
    });
  });

  // WebRTC signaling: ICE candidate
  socket.on('ice-candidate', ({ roomCode, targetUserId, candidate, fromUserId }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const targetParticipant = room.participants.get(targetUserId);
    if (!targetParticipant) return;

    io.to(targetParticipant.socketId).emit('ice-candidate', {
      fromUserId,
      candidate
    });
  });

  // Chat message
  socket.on('chat-message', ({ roomCode, message, userId, userName }) => {
    const room = rooms.get(roomCode);
    if (!room || !room.participants.has(userId)) return;

    console.log(`Chat message in ${roomCode} from ${userName}: ${message}`);

    const chatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      sender: userName,
      content: message,
      timestamp: new Date().toISOString(),
      userId
    };

    // Broadcast to all participants in the room (including sender)
    io.to(roomCode).emit('chat-message', chatMessage);
  });

  // Cake cutting event
  socket.on('start-cake-cutting', ({ roomCode, userId, birthdayPerson }) => {
    const room = rooms.get(roomCode);
    if (!room || room.host !== userId) return;

    console.log(`Cake cutting started in ${roomCode}`);

    io.to(roomCode).emit('cake-cutting-started', { birthdayPerson });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    if (currentRoom && currentUserId) {
      const room = rooms.get(currentRoom);
      
      if (room) {
        const participant = room.participants.get(currentUserId);
        const userName = participant ? participant.userName : 'Unknown';
        
        room.participants.delete(currentUserId);

        // If room is empty or host left, delete the room
        if (room.participants.size === 0 || room.host === currentUserId) {
          console.log(`Room ${currentRoom} is being closed`);
          
          // Notify all participants
          io.to(currentRoom).emit('room-closed', {
            reason: room.host === currentUserId ? 'Host left the party' : 'Room is empty'
          });
          
          rooms.delete(currentRoom);
        } else {
          // Notify others about user leaving
          socket.to(currentRoom).emit('user-left', {
            userId: currentUserId,
            userName,
            participantCount: room.participants.size
          });
        }
      }
    }
  });

  // Explicit leave room
  socket.on('leave-room', ({ roomCode, userId }) => {
    if (!roomCode || !userId) return;

    const room = rooms.get(roomCode);
    if (!room) return;

    const participant = room.participants.get(userId);
    const userName = participant ? participant.userName : 'Unknown';
    
    room.participants.delete(userId);
    socket.leave(roomCode);

    console.log(`${userName} left room ${roomCode}`);

    // If room is empty or host left, delete the room
    if (room.participants.size === 0 || room.host === userId) {
      console.log(`Room ${roomCode} is being closed`);
      
      io.to(roomCode).emit('room-closed', {
        reason: room.host === userId ? 'Host left the party' : 'Room is empty'
      });
      
      rooms.delete(roomCode);
    } else {
      // Notify others
      socket.to(roomCode).emit('user-left', {
        userId,
        userName,
        participantCount: room.participants.size
      });
    }

    currentRoom = null;
    currentUserId = null;
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeRooms: rooms.size,
    uptime: process.uptime()
  });
});

// Get room status (for debugging)
app.get('/room/:roomCode', (req, res) => {
  const { roomCode } = req.params;
  const roomInfo = getRoomInfo(roomCode);
  
  if (!roomInfo) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json(roomInfo);
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.io server running on port ${PORT}`);
  console.log(`📡 Accepting connections from: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`);
});

// Cleanup old rooms (every 1 hour)
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [roomCode, room] of rooms.entries()) {
    if (now - room.createdAt > oneHour && room.participants.size === 0) {
      console.log(`Cleaning up old room: ${roomCode}`);
      rooms.delete(roomCode);
    }
  }
}, 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
