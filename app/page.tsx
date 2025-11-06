"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Cake, Users, Sparkles } from "lucide-react";
import { VideoCallGuide } from "@/components/VideoCallGuide";

export default function Home() {
  const router = useRouter();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [partyDetails, setPartyDetails] = useState({
    hostName: "",
    birthdayPersonName: ""
  });

  const handleCreateParty = () => {
    if (!partyDetails.hostName || !partyDetails.birthdayPersonName) {
      alert("Please fill in all fields");
      return;
    }
    
    // Generate a random 6-character room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Navigate to party room with host role
    router.push(
      `/party/${roomCode}?host=${encodeURIComponent(partyDetails.hostName)}&birthday=${encodeURIComponent(partyDetails.birthdayPersonName)}&role=host`
    );
  };

  const handleJoinParty = () => {
    if (!joinCode.trim()) {
      alert("Please enter a party code");
      return;
    }
    
    const userName = prompt("Enter your name:");
    if (!userName) return;
    
    // Navigate to party room as participant
    router.push(`/party/${joinCode.toUpperCase()}?name=${encodeURIComponent(userName)}&role=participant`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cake className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight py-1">
              Den Day
            </h1>
            <Sparkles className="w-12 h-12 text-pink-600" />
          </div>
          <p className="text-xl text-gray-600">
            Celebrate birthdays together, no matter where you are
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Party Card */}
          <Card className="hover:shadow-2xl transition-shadow duration-300 border-2 border-purple-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Cake className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Create Party</CardTitle>
              <CardDescription>
                Host a virtual birthday celebration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
              >
                Create New Party
              </Button>
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                  Get a unique party code
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                  Share with friends and family
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                  Host the celebration
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Join Party Card */}
          <Card className="hover:shadow-2xl transition-shadow duration-300 border-2 border-pink-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <CardTitle className="text-2xl">Join Party</CardTitle>
              <CardDescription>
                Join an existing celebration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowJoinDialog(true)}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-lg py-6"
              >
                Join Existing Party
              </Button>
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-pink-600 rounded-full"></span>
                  Enter the party code
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-pink-600 rounded-full"></span>
                  Connect with everyone
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-pink-600 rounded-full"></span>
                  Celebrate together
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Create Party Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Your Party</DialogTitle>
              <DialogDescription>
                Fill in the details to start your virtual birthday celebration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="hostName">Your Name (Host)</Label>
                <Input
                  id="hostName"
                  placeholder="Enter your name"
                  value={partyDetails.hostName}
                  onChange={(e) => setPartyDetails({ ...partyDetails, hostName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdayPerson">Birthday Person&apos;s Name</Label>
                <Input
                  id="birthdayPerson"
                  placeholder="Who are we celebrating?"
                  value={partyDetails.birthdayPersonName}
                  onChange={(e) => setPartyDetails({ ...partyDetails, birthdayPersonName: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleCreateParty} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Create Party & Get Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Party Dialog */}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Party</DialogTitle>
              <DialogDescription>
                Enter the party code shared by the host
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="partyCode">Party Code</Label>
                <Input
                  id="partyCode"
                  placeholder="Enter 6-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="uppercase text-center text-2xl tracking-widest"
                />
              </div>
              <Button 
                onClick={handleJoinParty} 
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
              >
                Join Party
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Video Call Guide */}
      <VideoCallGuide />
    </main>
  );
}
