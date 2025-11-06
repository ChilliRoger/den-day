import { io, Socket } from 'socket.io-client';

export interface SignalData {
  type: 'offer' | 'answer' | 'ice-candidate';
  fromUserId: string;
  fromUserName?: string;
  offer?: any;
  answer?: any;
  candidate?: any;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  userId: string;
}

export interface ParticipantInfo {
  userId: string;
  userName: string;
  isHost: boolean;
}

class SocketSignalingService {
  private socket: Socket | null = null;
  private currentRoom: string | null = null;
  private currentUserId: string | null = null;
  private isConnected: boolean = false;

  // Event handlers
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onErrorCallback?: (error: string) => void;
  private onRoomCreatedCallback?: (roomInfo: any) => void;
  private onRoomJoinedCallback?: (roomInfo: any) => void;
  private onUserJoinedCallback?: (userId: string, userName: string) => void;
  private onUserLeftCallback?: (userId: string, userName: string) => void;
  private onExistingParticipantsCallback?: (participants: ParticipantInfo[]) => void;
  private onOfferCallback?: (fromUserId: string, fromUserName: string, offer: any) => void;
  private onAnswerCallback?: (fromUserId: string, fromUserName: string, answer: any) => void;
  private onIceCandidateCallback?: (fromUserId: string, candidate: any) => void;
  private onChatMessageCallback?: (message: ChatMessage) => void;
  private onCakeCuttingCallback?: (birthdayPerson: string) => void;
  private onRoomClosedCallback?: (reason: string) => void;

  connect(
    onConnected?: () => void,
    onDisconnected?: () => void,
    onError?: (error: string) => void
  ) {
    if (this.socket?.connected) {
      console.log('✅ Already connected to server');
      // Still setup event listeners in case callbacks changed
      this.setupEventListeners();
      onConnected?.();
      return;
    }

    if (this.socket && !this.socket.connected) {
      console.log('♻️ Reconnecting existing socket...');
      this.socket.connect();
      this.setupEventListeners();
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    console.log('🔌 Connecting to Socket.io server:', socketUrl);

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.onConnectedCallback = onConnected;
    this.onDisconnectedCallback = onDisconnected;
    this.onErrorCallback = onError;

    this.socket.on('connect', () => {
      console.log('✅ Connected to signaling server');
      this.isConnected = true;
      this.onConnectedCallback?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      this.isConnected = false;
      this.onDisconnectedCallback?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.onErrorCallback?.(`Connection failed: ${error.message}`);
    });

    this.socket.on('error', (data) => {
      console.error('Server error:', data.message);
      this.onErrorCallback?.(data.message);
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Remove all existing listeners first to prevent duplicates
    this.socket.removeAllListeners();

    // Room events
    this.socket.on('room-created', (data) => {
      console.log('Room created:', data);
      this.currentRoom = data.roomCode;
      this.onRoomCreatedCallback?.(data.roomInfo);
    });

    this.socket.on('room-joined', (data) => {
      console.log('Room joined:', data);
      this.currentRoom = data.roomCode;
      this.onRoomJoinedCallback?.(data.roomInfo);
    });

    this.socket.on('existing-participants', (data) => {
      console.log('Existing participants:', data.participants);
      this.onExistingParticipantsCallback?.(data.participants);
    });

    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      this.onUserJoinedCallback?.(data.userId, data.userName);
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data);
      this.onUserLeftCallback?.(data.userId, data.userName);
    });

    this.socket.on('room-closed', (data) => {
      console.log('Room closed:', data.reason);
      this.onRoomClosedCallback?.(data.reason);
      this.currentRoom = null;
    });

    // WebRTC signaling events
    this.socket.on('offer', (data) => {
      console.log('Received offer from:', data.fromUserName);
      this.onOfferCallback?.(data.fromUserId, data.fromUserName, data.offer);
    });

    this.socket.on('answer', (data) => {
      console.log('Received answer from:', data.fromUserName);
      this.onAnswerCallback?.(data.fromUserId, data.fromUserName, data.answer);
    });

    this.socket.on('ice-candidate', (data) => {
      this.onIceCandidateCallback?.(data.fromUserId, data.candidate);
    });

    // Chat events
    this.socket.on('chat-message', (message) => {
      this.onChatMessageCallback?.(message);
    });

    // Cake cutting event
    this.socket.on('cake-cutting-started', (data) => {
      this.onCakeCuttingCallback?.(data.birthdayPerson);
    });
  }

  createRoom(
    roomCode: string,
    userId: string,
    userName: string,
    hostName: string,
    birthdayPerson: string,
    onCreated: (roomInfo: any) => void
  ) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.currentUserId = userId;
    this.onRoomCreatedCallback = onCreated;

    this.socket.emit('create-room', {
      roomCode,
      userId,
      userName,
      hostName,
      birthdayPerson
    });
  }

  joinRoom(
    roomCode: string,
    userId: string,
    userName: string,
    onJoined: (roomInfo: any) => void
  ) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.currentUserId = userId;
    this.onRoomJoinedCallback = onJoined;

    this.socket.emit('join-room', {
      roomCode,
      userId,
      userName
    });
  }

  sendOffer(roomCode: string, targetUserId: string, offer: any, fromUserId: string, fromUserName: string) {
    if (!this.socket) return;
    
    this.socket.emit('offer', {
      roomCode,
      targetUserId,
      offer,
      fromUserId,
      fromUserName
    });
  }

  sendAnswer(roomCode: string, targetUserId: string, answer: any, fromUserId: string, fromUserName: string) {
    if (!this.socket) return;
    
    this.socket.emit('answer', {
      roomCode,
      targetUserId,
      answer,
      fromUserId,
      fromUserName
    });
  }

  sendIceCandidate(roomCode: string, targetUserId: string, candidate: any, fromUserId: string) {
    if (!this.socket) return;
    
    this.socket.emit('ice-candidate', {
      roomCode,
      targetUserId,
      candidate,
      fromUserId
    });
  }

  sendChatMessage(roomCode: string, message: string, userId: string, userName: string) {
    if (!this.socket) return;
    
    this.socket.emit('chat-message', {
      roomCode,
      message,
      userId,
      userName
    });
  }

  startCakeCutting(roomCode: string, userId: string, birthdayPerson: string) {
    if (!this.socket) return;
    
    this.socket.emit('start-cake-cutting', {
      roomCode,
      userId,
      birthdayPerson
    });
  }

  leaveRoom(roomCode: string, userId: string) {
    if (!this.socket) return;
    
    this.socket.emit('leave-room', {
      roomCode,
      userId
    });
  }

  // Register event callbacks
  onUserJoined(callback: (userId: string, userName: string) => void) {
    this.onUserJoinedCallback = callback;
  }

  onUserLeft(callback: (userId: string, userName: string) => void) {
    this.onUserLeftCallback = callback;
  }

  onExistingParticipants(callback: (participants: ParticipantInfo[]) => void) {
    this.onExistingParticipantsCallback = callback;
  }

  onOffer(callback: (fromUserId: string, fromUserName: string, offer: any) => void) {
    this.onOfferCallback = callback;
  }

  onAnswer(callback: (fromUserId: string, fromUserName: string, answer: any) => void) {
    this.onAnswerCallback = callback;
  }

  onIceCandidate(callback: (fromUserId: string, candidate: any) => void) {
    this.onIceCandidateCallback = callback;
  }

  onChatMessage(callback: (message: ChatMessage) => void) {
    this.onChatMessageCallback = callback;
  }

  onCakeCutting(callback: (birthdayPerson: string) => void) {
    this.onCakeCuttingCallback = callback;
  }

  onRoomClosed(callback: (reason: string) => void) {
    this.onRoomClosedCallback = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoom = null;
      this.currentUserId = null;
      this.isConnected = false;
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getCurrentRoom(): string | null {
    return this.currentRoom;
  }
}

export const socketSignaling = new SocketSignalingService();
