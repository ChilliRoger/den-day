"use client";

import { useEffect, useRef } from "react";
import { Participant } from "@/store/partyStore";
import { Card } from "@/components/ui/card";
import { User, Users } from "lucide-react";

interface VideoGridProps {
  participants: Participant[];
}

export function VideoGrid({ participants }: VideoGridProps) {
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    // Set up video streams for all participants
    participants.forEach((participant) => {
      const videoElement = videoRefs.current[participant.id];
      if (videoElement && participant.stream) {
        videoElement.srcObject = participant.stream;
        
        // Ensure audio plays for remote participants
        if (!participant.isLocal) {
          videoElement.volume = 1.0;
          videoElement.muted = false;
          
          // Attempt to play (needed for some browsers)
          videoElement.play().catch((error) => {
            console.warn(`Auto-play blocked for ${participant.name}:`, error);
          });
        }
      }
    });
  }, [participants]);

  // Calculate grid layout based on participant count
  const getGridCols = () => {
    const count = participants.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    return "grid-cols-4";
  };

  const getVideoHeight = () => {
    const count = participants.length;
    if (count === 1) return "h-[600px]";
    if (count === 2) return "h-[400px]";
    if (count <= 4) return "h-[300px]";
    return "h-[250px]";
  };

  if (participants.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Waiting for participants...</p>
          <p className="text-sm text-gray-500">Invite friends to join the party!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {participants.map((participant) => (
        <Card
          key={participant.id}
          className={`relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 ${getVideoHeight()} shadow-lg border-2 ${
            participant.isLocal 
              ? 'border-purple-400 ring-2 ring-purple-300' 
              : 'border-gray-700'
          } transition-all hover:shadow-2xl`}
        >
          <video
            ref={(el) => {
              videoRefs.current[participant.id] = el;
            }}
            autoPlay
            playsInline
            muted={participant.isLocal} // Mute local video to prevent echo
            className="w-full h-full object-cover"
            onLoadedMetadata={(e) => {
              const videoEl = e.currentTarget;
              const stream = videoEl.srcObject as MediaStream;
              if (stream) {
                const audioTracks = stream.getAudioTracks();
                const videoTracks = stream.getVideoTracks();
                console.log(`📺 Video loaded for: ${participant.name}`);
                console.log(`   Audio tracks: ${audioTracks.length}`, audioTracks.map(t => `${t.label} (enabled: ${t.enabled})`));
                console.log(`   Video tracks: ${videoTracks.length}`, videoTracks.map(t => `${t.label} (enabled: ${t.enabled})`));
                console.log(`   Video element muted: ${videoEl.muted}, volume: ${videoEl.volume}`);
              }
            }}
          />
          
          {/* Placeholder when no video */}
          {!participant.stream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-4 ring-white/30">
                  <User className="w-10 h-10 text-white" />
                </div>
                <p className="text-white font-semibold text-lg">{participant.name}</p>
                <p className="text-white/70 text-sm mt-1">Connecting...</p>
              </div>
            </div>
          )}
          
          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${participant.stream ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-white font-semibold text-sm drop-shadow-lg">
                  {participant.name} {participant.isLocal && "(You)"}
                </span>
              </div>
              {participant.isHost && (
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full shadow-lg">
                  Host
                </span>
              )}
            </div>
          </div>

          {/* Local indicator */}
          {participant.isLocal && (
            <div className="absolute top-3 right-3">
              <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                YOU
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
