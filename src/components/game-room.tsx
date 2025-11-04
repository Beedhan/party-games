"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Users, Gamepad2, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GameRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");
  const router = useRouter();
  const generateRoomCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleCreateRoom = () => {
    setIsCreating(true);
    const newCode = generateRoomCode();
    router.push(
      `/${selectedGame}/${newCode}?name=${encodeURIComponent(playerName)}`
    );
  };

  const handleJoinRoom = () => {
    console.log("[v0] Joining room:", roomCode, "as player:", playerName);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-4">
            <Gamepad2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-balance tracking-tight">
            Party Game Night
          </h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Create a room or join your friends for an epic gaming session
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create Room Card */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Create Room</CardTitle>
                  <CardDescription className="text-base">
                    Start a new game session
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-base">
                  Your Name
                </Label>
                <Input
                  id="create-name"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-base">
                  Select Game
                </Label>
                <Select onValueChange={(value) => setSelectedGame(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Games</SelectLabel>
                      <SelectItem value="imposter">Imposter</SelectItem>
                      <SelectItem value="next-word">Next Word</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {roomCode && (
                <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/20 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Your Room Code
                  </p>
                  <p className="text-3xl font-bold font-mono tracking-wider text-primary">
                    {roomCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Share this code with your friends!
                  </p>
                </div>
              )}

              <Button
                onClick={handleCreateRoom}
                disabled={!playerName || isCreating}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isCreating ? (
                  "Creating Room..."
                ) : (
                  <>
                    Create Room
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Join Room</CardTitle>
                  <CardDescription className="text-base">
                    Enter a room code to play
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="join-name" className="text-base">
                  Your Name
                </Label>
                <Input
                  id="join-name"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-code" className="text-base">
                  Room Code
                </Label>
                <Input
                  id="room-code"
                  placeholder="Enter 6-digit code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="h-12 text-base font-mono tracking-wider uppercase"
                />
              </div>

              <Button
                onClick={handleJoinRoom}
                disabled={!playerName || roomCode.length !== 6}
                variant="secondary"
                className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                Join Room
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-6 rounded-xl bg-card border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Instant Setup</h3>
            <p className="text-sm text-muted-foreground">
              Create or join rooms in seconds
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Multiplayer Fun</h3>
            <p className="text-sm text-muted-foreground">
              Play with friends anywhere
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Gamepad2 className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Easy to Play</h3>
            <p className="text-sm text-muted-foreground">
              Simple controls, endless entertainment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
