import SimplePeer from 'simple-peer';
import { socketSignaling, ParticipantInfo } from './signaling';

export interface PeerConnection {
  peer: SimplePeer.Instance;
  userId: string;
  userName: string;
  stream?: MediaStream;
}

export class WebRTCService {
  private peers: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private roomCode: string = '';
  private userId: string = '';
  private userName: string = '';
  private onStreamCallback?: (userId: string, stream: MediaStream, userName: string) => void;
  private onPeerLeftCallback?: (userId: string) => void;
  private isHost: boolean = false;

  async initialize(
    roomCode: string, 
    userId: string, 
    userName: string,
    isHost: boolean,
    hostName?: string,
    birthdayPerson?: string,
    onStream?: (userId: string, stream: MediaStream, userName: string) => void,
    onPeerLeft?: (userId: string) => void,
    onConnected?: () => void,
    onError?: (error: string) => void
  ) {
    this.roomCode = roomCode;
    this.userId = userId;
    this.userName = userName;
    this.onStreamCallback = onStream;
    this.onPeerLeftCallback = onPeerLeft;
    this.isHost = isHost;

    try {
      // Get local media stream first
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Connect to signaling server
      socketSignaling.connect(
        () => {
          console.log('Connected to signaling server');
          
          // Setup signaling event handlers
          this.setupSignalingHandlers();
          
          // Create or join room
          if (isHost) {
            socketSignaling.createRoom(
              roomCode,
              userId,
              userName,
              hostName || userName,
              birthdayPerson || 'Birthday Person',
              (roomInfo) => {
                console.log('Room created:', roomInfo);
                onConnected?.();
              }
            );
          } else {
            socketSignaling.joinRoom(
              roomCode,
              userId,
              userName,
              (roomInfo) => {
                console.log('Room joined:', roomInfo);
                onConnected?.();
              }
            );
          }
        },
        () => {
          console.log('Disconnected from signaling server');
          onError?.('Disconnected from server');
        },
        (error) => {
          console.error('Signaling error:', error);
          onError?.(error);
        }
      );

      return this.localStream;
    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  private setupSignalingHandlers() {
    // Handle existing participants (when joining)
    socketSignaling.onExistingParticipants((participants: ParticipantInfo[]) => {
      console.log('🔗 Creating connections to existing participants:', participants);
      participants.forEach(participant => {
        console.log(`Creating peer connection to: ${participant.userName} (${participant.userId})`);
        this.createPeerConnection(participant.userId, participant.userName, true);
      });
    });

    // Handle new user joining
    socketSignaling.onUserJoined((userId: string, userName: string) => {
      console.log('👋 New user joined:', userName, '- Waiting for their offer');
      // Don't create connection yet, wait for them to send offer
    });

    // Handle user leaving
    socketSignaling.onUserLeft((userId: string, userName: string) => {
      console.log('👋 User left:', userName);
      this.removePeer(userId);
    });

    // Handle WebRTC offers
    socketSignaling.onOffer((fromUserId: string, fromUserName: string, offer: any) => {
      console.log('📨 Received offer from:', fromUserName);
      
      if (!this.peers.has(fromUserId)) {
        console.log(`Creating new peer connection for offer from: ${fromUserName}`);
        const peerConnection = this.createPeerConnection(fromUserId, fromUserName, false);
        peerConnection.peer.signal(offer);
      } else {
        console.log(`Signaling existing peer for: ${fromUserName}`);
        this.peers.get(fromUserId)?.peer.signal(offer);
      }
    });

    // Handle WebRTC answers
    socketSignaling.onAnswer((fromUserId: string, fromUserName: string, answer: any) => {
      console.log('✅ Received answer from:', fromUserName);
      const peerConnection = this.peers.get(fromUserId);
      if (peerConnection) {
        peerConnection.peer.signal(answer);
      } else {
        console.warn(`No peer connection found for answer from: ${fromUserName}`);
      }
    });

    // Handle ICE candidates
    socketSignaling.onIceCandidate((fromUserId: string, candidate: any) => {
      const peerConnection = this.peers.get(fromUserId);
      if (peerConnection) {
        peerConnection.peer.signal(candidate);
      } else {
        console.warn(`No peer connection found for ICE candidate from: ${fromUserId}`);
      }
    });

    // Handle room closed
    socketSignaling.onRoomClosed((reason: string) => {
      console.log('Room closed:', reason);
      this.cleanup();
    });
  }

  private createPeerConnection(userId: string, userName: string, initiator: boolean): PeerConnection {
    const peer = new SimplePeer({
      initiator,
      stream: this.localStream || undefined,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });

    const peerConnection: PeerConnection = {
      peer,
      userId,
      userName
    };

    peer.on('signal', (data: any) => {
      if (data.type === 'offer') {
        socketSignaling.sendOffer(this.roomCode, userId, data, this.userId, this.userName);
      } else if (data.type === 'answer') {
        socketSignaling.sendAnswer(this.roomCode, userId, data, this.userId, this.userName);
      } else {
        // ICE candidate
        socketSignaling.sendIceCandidate(this.roomCode, userId, data, this.userId);
      }
    });

    peer.on('stream', (stream: MediaStream) => {
      console.log('🎥 Received video stream from:', userName);
      peerConnection.stream = stream;
      if (this.onStreamCallback) {
        this.onStreamCallback(userId, stream, userName);
      } else {
        console.warn('No onStreamCallback defined!');
      }
    });

    peer.on('connect', () => {
      console.log('✅ Peer connection established with:', userName);
    });

    peer.on('error', (err: Error) => {
      console.error('❌ Peer error with', userName, ':', err);
      this.removePeer(userId);
    });

    peer.on('close', () => {
      console.log('🔌 Peer connection closed with:', userName);
      this.removePeer(userId);
    });

    this.peers.set(userId, peerConnection);
    return peerConnection;
  }

  private removePeer(userId: string) {
    const peerConnection = this.peers.get(userId);
    if (peerConnection) {
      peerConnection.peer.destroy();
      this.peers.delete(userId);
      if (this.onPeerLeftCallback) {
        this.onPeerLeftCallback(userId);
      }
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      console.log(`Toggling audio to: ${enabled}, Found ${audioTracks.length} audio tracks`);
      audioTracks.forEach(track => {
        track.enabled = enabled;
        console.log(`Audio track "${track.label}" enabled: ${track.enabled}`);
      });
    } else {
      console.warn('No local stream available for audio toggle');
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      console.log(`Toggling video to: ${enabled}, Found ${videoTracks.length} video tracks`);
      videoTracks.forEach(track => {
        track.enabled = enabled;
        console.log(`Video track "${track.label}" enabled: ${track.enabled}`);
      });
    } else {
      console.warn('No local stream available for video toggle');
    }
  }

  cleanup() {
    // Leave room on server
    if (this.roomCode && this.userId) {
      socketSignaling.leaveRoom(this.roomCode, this.userId);
    }

    // Close all peer connections
    this.peers.forEach(peerConnection => {
      peerConnection.peer.destroy();
    });
    this.peers.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Disconnect from signaling server
    socketSignaling.disconnect();
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getPeers(): Map<string, PeerConnection> {
    return this.peers;
  }
}
