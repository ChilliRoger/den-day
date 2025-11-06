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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="relative max-w-2xl w-full p-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎂 Cake Cutting Time! 🎂
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Let&apos;s celebrate {birthdayPerson}&apos;s special day!
          </p>

          {/* Cake Animation */}
          <div className="relative mb-8">
            <div className={`text-9xl transition-transform duration-1000 ${isAnimating ? "scale-150" : "scale-100"}`}>
              🎂
            </div>
            
            {isAnimating && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-6xl animate-pulse">✨</div>
              </div>
            )}
          </div>

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                    fontSize: `${20 + Math.random() * 20}px`,
                  }}
                >
                  {["🎉", "🎊", "✨", "🎈", "🎁"][Math.floor(Math.random() * 5)]}
                </div>
              ))}
            </div>
          )}

          {!isAnimating ? (
            <Button
              onClick={handleCutCake}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-lg px-8 py-6"
            >
              <Cake className="w-6 h-6 mr-2" />
              Cut the Cake!
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-2xl font-bold text-purple-600 animate-bounce">
                🎉 Happy Birthday {birthdayPerson}! 🎉
              </p>
              <p className="text-lg text-gray-700">
                Wishing you a wonderful year ahead filled with joy and happiness!
              </p>
              <Button
                onClick={onClose}
                variant="outline"
                className="mt-4"
              >
                Close
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
            transform: translateY(100vh) rotate(360deg);
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
