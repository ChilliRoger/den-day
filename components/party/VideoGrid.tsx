"use client";

import { useEffect, useRef } from "react";
import { Participant } from "@/store/partyStore";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface VideoGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
}

export function VideoGrid({ participants, localStream }: VideoGridProps) {
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    // Set up local video stream
    if (localStream && participants.length > 0) {
      const localParticipant = participants[0];
      const videoElement = videoRefs.current[localParticipant.id];
      if (videoElement) {
        videoElement.srcObject = localStream;
      }
    }
  }, [localStream, participants]);

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

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {participants.map((participant) => (
        <Card
          key={participant.id}
          className={`relative overflow-hidden bg-gray-900 ${getVideoHeight()}`}
        >
          <video
            ref={(el) => {
              videoRefs.current[participant.id] = el;
            }}
            autoPlay
            playsInline
            muted={participant.id === participants[0]?.id} // Mute local video
            className="w-full h-full object-cover"
          />
          
          {/* Placeholder when no video */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <p className="text-white font-medium">{participant.name}</p>
            </div>
          </div>
          
          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{participant.name}</span>
              {participant.isHost && (
                <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                  Host
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
