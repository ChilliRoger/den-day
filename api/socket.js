const { Server } = require("socket.io");

const rooms = new Map();

module.exports = (req, res) => {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.io");
    
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("create-room", ({ roomCode, userName }) => {
        if (rooms.has(roomCode)) {
          socket.emit("room-error", { message: "Room already exists" });
          return;
        }

        rooms.set(roomCode, {
          host: socket.id,
          participants: [{ id: socket.id, name: userName }],
        });

        socket.join(roomCode);
        socket.emit("room-created", { roomCode });
        console.log(`Room created: ${roomCode} by ${userName}`);
      });

      socket.on("join-room", ({ roomCode, userName }) => {
        const room = rooms.get(roomCode);

        if (!room) {
          socket.emit("room-error", { message: "Room not found" });
          return;
        }

        room.participants.push({ id: socket.id, name: userName });
        socket.join(roomCode);

        io.to(roomCode).emit("user-joined", {
          userId: socket.id,
          userName,
          participants: room.participants,
        });

        socket.emit("room-joined", {
          roomCode,
          participants: room.participants,
          isHost: room.host === socket.id,
        });

        console.log(`${userName} joined room: ${roomCode}`);
      });

      socket.on("offer", ({ to, offer, from }) => {
        io.to(to).emit("offer", { from, offer });
      });

      socket.on("answer", ({ to, answer, from }) => {
        io.to(to).emit("answer", { from, answer });
      });

      socket.on("ice-candidate", ({ to, candidate, from }) => {
        io.to(to).emit("ice-candidate", { from, candidate });
      });

      socket.on("chat-message", ({ roomCode, message, userName }) => {
        io.to(roomCode).emit("chat-message", {
          id: Date.now().toString(),
          userName,
          message,
          timestamp: new Date(),
        });
      });

      socket.on("cake-cutting", ({ roomCode }) => {
        io.to(roomCode).emit("cake-cutting");
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        for (const [roomCode, room] of rooms.entries()) {
          const participantIndex = room.participants.findIndex(
            (p) => p.id === socket.id
          );

          if (participantIndex !== -1) {
            const participant = room.participants[participantIndex];
            room.participants.splice(participantIndex, 1);

            io.to(roomCode).emit("user-left", {
              userId: socket.id,
              participants: room.participants,
            });

            if (room.participants.length === 0) {
              rooms.delete(roomCode);
              console.log(`Room ${roomCode} deleted (empty)`);
            } else if (room.host === socket.id && room.participants.length > 0) {
              room.host = room.participants[0].id;
              io.to(roomCode).emit("host-changed", {
                newHostId: room.host,
              });
            }

            console.log(`${participant.name} left room: ${roomCode}`);
            break;
          }
        }
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("Socket.io already set up");
  }
  res.end();
};
