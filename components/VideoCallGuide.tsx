"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";

export function VideoCallGuide() {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 rounded-full shadow-lg"
      >
        <Info className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-2xl z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            How to Use Den Day
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        <p className="font-semibold text-purple-600">Host a Party:</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Click &quot;Create Party&quot; and enter your name</li>
          <li>Share the room code with your guests</li>
          <li>Allow camera and microphone access</li>
          <li>Wait for guests to join</li>
          <li>Click &quot;Cut the Cake&quot; to celebrate! 🎂</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs mt-3">
          <p className="font-semibold text-blue-800">💡 Tips:</p>
          <p className="text-blue-700">• Use mute/video buttons to control your audio and video</p>
          <p className="text-blue-700">• Chat with guests using the chat panel</p>
          <p className="text-blue-700">• Share the room code via WhatsApp, email, or text</p>
        </div>
      </CardContent>
    </Card>
  );
}
