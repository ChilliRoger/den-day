"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { Message } from "@/store/partyStore";
import { usePartyStore } from "@/store/partyStore";
import { socketSignaling } from "@/lib/signaling";

interface ChatAreaProps {
  messages: Message[];
  currentUserName: string;
  roomCode: string;
  userId: string;
}

export function ChatArea({ messages, currentUserName, roomCode, userId }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addMessage } = usePartyStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Send message via Socket.io - server will broadcast it back to everyone including sender
    socketSignaling.sendChatMessage(roomCode, newMessage, userId, currentUserName);
    
    // Don't add to local store here - wait for server broadcast to avoid duplicates

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col shadow-lg border-2 border-pink-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-pink-100">
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Party Chat
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100 hover:scrollbar-thumb-purple-400">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-purple-400" />
              </div>
              <p className="font-medium text-gray-600">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.sender === currentUserName ? "items-end" : "items-start"
                } animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.sender === "System"
                      ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 text-center w-full max-w-full border border-purple-200"
                      : message.sender === currentUserName
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  {message.sender !== "System" && message.sender !== currentUserName && (
                    <p className="text-xs font-bold mb-1 opacity-75">
                      {message.sender}
                    </p>
                  )}
                  <p className="text-sm break-words leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1.5 ${
                    message.sender === currentUserName ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2 items-center">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border-2 border-purple-200 focus:border-purple-400 rounded-xl px-4 py-3 focus-visible:ring-purple-400"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
