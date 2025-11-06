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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const { 
    participants, 
    messages, 
    addParticipant, 
    removeParticipant,
    addMessage,
    setRoomCode: setStoreRoomCode 
  } = usePartyStore();

  useEffect(() => {
    // Initialize party store
    setStoreRoomCode(roomCode);
    
    // Add current user as participant
    const currentUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === "host" ? hostName || "Host" : participantName || "Guest",
      isHost: role === "host",
      stream: null
    };
    
    addParticipant(currentUser);
    
    // Initialize media stream
    initializeMedia();
    
    // Simulate other participants joining (in real implementation, this would be via WebSocket)
    // For demo purposes
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
    
    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      addMessage({
        id: Date.now().toString(),
        sender: "System",
        content: "Could not access camera/microphone. Please check permissions.",
        timestamp: new Date()
      });
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const startCakeCutting = () => {
    setShowCakeCutting(true);
    addMessage({
      id: Date.now().toString(),
      sender: "System",
      content: `🎂 ${birthdayPerson} is cutting the cake! 🎂`,
      timestamp: new Date()
    });
  };

  const leaveParty = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Cake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {birthdayPerson ? `${birthdayPerson}'s Birthday Party` : "Birthday Party"}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-mono font-bold text-purple-600">
                  {roomCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyRoomCode}
                  className="h-8 w-8"
                >
                  <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : ''}`} />
                </Button>
              </div>
              
              {role === "host" && (
                <Button
                  onClick={startCakeCutting}
                  className="bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  <Cake className="w-4 h-4 mr-2" />
                  Cut Cake
                </Button>
              )}
              
              <Button
                variant="destructive"
                onClick={leaveParty}
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
          <Card className="p-4">
            <VideoGrid 
              participants={participants}
              localStream={localStream}
            />
          </Card>
          
          {/* Controls */}
          <Card className="p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="icon"
                onClick={toggleMute}
                className="h-12 w-12 rounded-full"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                variant={isVideoOff ? "destructive" : "outline"}
                size="icon"
                onClick={toggleVideo}
                className="h-12 w-12 rounded-full"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-1">
          <ChatArea 
            messages={messages}
            currentUserName={role === "host" ? hostName || "Host" : participantName || "Guest"}
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
