"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cake, Sparkles, X } from "lucide-react";

interface CakeCuttingProps {
  birthdayPerson: string;
  onClose: () => void;
}

export function CakeCutting({ birthdayPerson, onClose }: CakeCuttingProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleCutCake = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowConfetti(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <Card className="relative max-w-2xl w-full p-12 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 shadow-2xl border-4 border-purple-200 animate-in zoom-in-95 duration-500">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 hover:bg-white/50 rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-in slide-in-from-top duration-700">
            🎂 Cake Cutting Time! 🎂
          </h2>
          <p className="text-2xl text-gray-700 mb-10 font-medium">
            Let&apos;s celebrate {birthdayPerson}&apos;s special day!
          </p>

          {/* Cake Animation */}
          <div className="relative mb-12 flex justify-center">
            <div className={`text-9xl transition-all duration-1000 ${
              isAnimating ? "scale-150 rotate-12" : "scale-100"
            }`}>
              🎂
            </div>
            
            {isAnimating && (
              <>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12">
                  <div className="text-6xl animate-ping">✨</div>
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-x-12">
                  <div className="text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</div>
                </div>
                <div className="absolute top-1/2 right-0 transform translate-x-12">
                  <div className="text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎊</div>
                </div>
              </>
            )}
          </div>

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
              {[...Array(60)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                    fontSize: `${24 + Math.random() * 24}px`,
                  }}
                >
                  {["🎉", "🎊", "✨", "🎈", "🎁", "🌟", "💫", "🎯"][Math.floor(Math.random() * 8)]}
                </div>
              ))}
            </div>
          )}

          {!isAnimating ? (
            <Button
              onClick={handleCutCake}
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-xl px-12 py-8 shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
            >
              <Cake className="w-7 h-7 mr-3" />
              Cut the Cake!
            </Button>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-bounce">
                🎉 Happy Birthday {birthdayPerson}! 🎉
              </p>
              <p className="text-xl text-gray-700 font-medium px-4">
                Wishing you a wonderful year ahead filled with joy, love, and endless happiness!
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <div className="bg-purple-100 text-purple-700 px-6 py-3 rounded-full font-semibold">
                  🎂 Make a Wish!
                </div>
                <div className="bg-pink-100 text-pink-700 px-6 py-3 rounded-full font-semibold">
                  🎊 Celebrate!
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="outline"
                className="mt-6 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg"
              >
                Close Celebration
              </Button>
            </div>
          )}
        </div>
      </Card>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(-10%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear forwards;
        }
      `}</style>
    </div>
  );
}
