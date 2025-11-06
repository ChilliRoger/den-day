"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Copy, 
  Users, 
  MessageSquare, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff,
  Cake,
  LogOut,
  Send
} from "lucide-react";
import { VideoGrid } from "@/components/party/VideoGrid";
import { ChatArea } from "@/components/party/ChatArea";
import { CakeCutting } from "@/components/party/CakeCutting";
import { usePartyStore } from "@/store/partyStore";
import { WebRTCService } from "@/lib/webrtc";
import { socketSignaling, ChatMessage as SocketChatMessage } from "@/lib/signaling";

export default function PartyRoom() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roomCode = params.roomCode as string;
  const role = searchParams.get("role");
  const hostName = searchParams.get("host");
  const birthdayPerson = searchParams.get("birthday");
  const participantName = searchParams.get("name");
  
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showCakeCutting, setShowCakeCutting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userId] = useState(() => Math.random().toString(36).substr(2, 9));
  
  const webrtcService = useRef<WebRTCService | null>(null);
  
  const { 
    participants, 
    messages, 
    addParticipant, 
    removeParticipant,
    updateParticipantStream,
    addMessage,
    setRoomCode: setStoreRoomCode,
    clearParticipants
  } = usePartyStore();

  useEffect(() => {
    const currentUserName = role === "host" ? hostName || "Host" : participantName || "Guest";
    
    // Initialize party store
    setStoreRoomCode(roomCode);
    clearParticipants();
    
    // Setup Socket.io chat handler
    socketSignaling.onChatMessage((message: SocketChatMessage) => {
      addMessage({
        id: message.id,
        sender: message.sender,
        content: message.content,
        timestamp: new Date(message.timestamp)
      });
    });

    // Setup cake cutting handler
    socketSignaling.onCakeCutting((birthdayPersonName: string) => {
      console.log('🎂 Cake cutting event received for:', birthdayPersonName);
      setShowCakeCutting(true);
      
      // Add system message for all users
      addMessage({
        id: Date.now().toString(),
        sender: "System",
        content: `🎂 ${birthdayPersonName} is cutting the cake! 🎂`,
        timestamp: new Date()
      });
    });
    
    // Initialize WebRTC
    const initWebRTC = async () => {
      try {
        webrtcService.current = new WebRTCService();
        
        const localStream = await webrtcService.current.initialize(
          roomCode,
          userId,
          currentUserName,
          role === "host",
          hostName || currentUserName,
          birthdayPerson || undefined,
          // On remote stream
          (remoteUserId: string, stream: MediaStream, remoteName: string) => {
            console.log('🎥 Received remote stream from:', remoteName, 'userId:', remoteUserId);
            
            // Add or update remote participant
            addParticipant({
              id: remoteUserId,
              name: remoteName,
              isHost: false,
              stream,
              isLocal: false
            });
            
            updateParticipantStream(remoteUserId, stream);
            console.log('✅ Added remote participant to store:', remoteName);
          },
          // On peer left
          (remoteUserId: string) => {
            console.log('Peer left:', remoteUserId);
            removeParticipant(remoteUserId);
          },
          // On connected
          () => {
            console.log('✅ Successfully connected to room:', roomCode);
            console.log('📊 Current user:', currentUserName, 'Role:', role);
            
            // Add local participant with stream
            addParticipant({
              id: userId,
              name: currentUserName,
              isHost: role === "host",
              stream: localStream,
              isLocal: true
            });

            setIsInitializing(false);
            console.log('✅ Local participant added to store');

            // Send welcome message for host
            if (role === "host") {
              setTimeout(() => {
                addMessage({
                  id: Date.now().toString(),
                  sender: "System",
                  content: `Welcome to ${birthdayPerson}'s birthday party! 🎉`,
                  timestamp: new Date()
                });
              }, 1000);
            }
          },
          // On error
          (error: string) => {
            console.error("Connection error:", error);
            addMessage({
              id: Date.now().toString(),
              sender: "System",
              content: `Connection error: ${error}`,
              timestamp: new Date()
            });
          }
        );

      } catch (error: any) {
        console.error("Error initializing WebRTC:", error);
        setIsInitializing(false);
        addMessage({
          id: Date.now().toString(),
          sender: "System",
          content: `Could not access camera/microphone: ${error.message || 'Unknown error'}`,
          timestamp: new Date()
        });
      }
    };

    initWebRTC();
    
    return () => {
      // Cleanup
      if (webrtcService.current) {
        webrtcService.current.cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMute = () => {
    if (webrtcService.current) {
      const newMutedState = !isMuted;
      webrtcService.current.toggleAudio(!newMutedState); // enabled = !muted
      setIsMuted(newMutedState);
      console.log(`🎤 Audio ${newMutedState ? 'muted' : 'unmuted'}`);
    }
  };

  const toggleVideo = () => {
    if (webrtcService.current) {
      const newVideoOffState = !isVideoOff;
      webrtcService.current.toggleVideo(!newVideoOffState); // enabled = !videoOff
      setIsVideoOff(newVideoOffState);
      console.log(`🎥 Video ${newVideoOffState ? 'off' : 'on'}`);
    }
  };

  const startCakeCutting = () => {
    console.log('🎂 Host initiating cake cutting...');
    
    // Send cake cutting event via Socket.io
    socketSignaling.startCakeCutting(roomCode, userId, birthdayPerson || "Birthday Person");
    
    // The server will broadcast to all users including host
    // So we don't need to manually trigger here anymore
  };

  const leaveParty = () => {
    if (webrtcService.current) {
      webrtcService.current.cleanup();
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <Card className="p-6 shadow-lg border-2 border-purple-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Cake className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {birthdayPerson ? `${birthdayPerson}'s Birthday Party` : "Birthday Party"}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1.5 bg-purple-100 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-100 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-700">Live</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-sm border border-purple-200">
                <span className="text-sm font-semibold text-gray-700">Room Code:</span>
                <span className="text-lg font-mono font-bold text-purple-700 tracking-wider">
                  {roomCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyRoomCode}
                  className="h-8 w-8 hover:bg-white/50"
                  title="Copy room code"
                >
                  <Copy className={`w-4 h-4 transition-colors ${copied ? 'text-green-600' : 'text-purple-600'}`} />
                </Button>
              </div>
              
              {role === "host" && (
                <Button
                  onClick={startCakeCutting}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Cake className="w-4 h-4 mr-2" />
                  Cut Cake
                </Button>
              )}
              
              <Button
                variant="destructive"
                onClick={leaveParty}
                className="shadow-lg hover:shadow-xl transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-4">
        {/* Video Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 shadow-lg border-2 border-purple-100">
            {isInitializing ? (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-lg font-medium">Connecting to video call...</p>
                  <p className="text-sm text-gray-400 mt-2">Please allow camera and microphone access</p>
                </div>
              </div>
            ) : (
              <VideoGrid 
                participants={participants}
              />
            )}
          </Card>
          
          {/* Controls */}
          <Card className="p-6 shadow-lg border-2 border-purple-100">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleMute}
                  className={`h-14 w-14 rounded-full shadow-lg transition-all ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'hover:bg-purple-50 border-2 border-purple-200'
                  }`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 text-purple-600" />}
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  {isMuted ? "Muted" : "Audio On"}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant={isVideoOff ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleVideo}
                  className={`h-14 w-14 rounded-full shadow-lg transition-all ${
                    isVideoOff 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'hover:bg-purple-50 border-2 border-purple-200'
                  }`}
                  title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6 text-purple-600" />}
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  {isVideoOff ? "Camera Off" : "Camera On"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-1">
          <ChatArea 
            messages={messages}
            currentUserName={role === "host" ? hostName || "Host" : participantName || "Guest"}
            roomCode={roomCode}
            userId={userId}
          />
        </div>
      </div>

      {/* Cake Cutting Modal */}
      {showCakeCutting && (
        <CakeCutting
          birthdayPerson={birthdayPerson || "Birthday Person"}
          onClose={() => setShowCakeCutting(false)}
        />
      )}
    </div>
  );
}
