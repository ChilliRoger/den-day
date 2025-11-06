"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";

export function VideoCallGuide() {
  const [isVisible, setIsVisible] = useState(true);

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
            Video Call Testing
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
        <p className="font-semibold text-purple-600">Testing on same computer:</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Create a party in this tab</li>
          <li>Copy the room code</li>
          <li>Open a new <strong>incognito/private window</strong></li>
          <li>Join using the room code</li>
          <li>Allow camera/mic in both tabs</li>
        </ol>
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
          <p className="font-semibold text-blue-800">💡 Tip:</p>
          <p className="text-blue-700">Use incognito mode to simulate different users on the same device!</p>
        </div>
      </CardContent>
    </Card>
  );
}
