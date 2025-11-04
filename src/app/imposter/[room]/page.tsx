"use client";
import { usePathname, useSearchParams } from "next/navigation";
import usePartySocket from "partysocket/react";
import React, { useState } from "react";
import { initialGameState, User } from "../../../../game/logic";
import { GameUpdaterAction } from "../../../../party";
import { Button } from "@/components/ui/button";
import { Copy, Users, Cast as Mask, LogOut, CirclePlay } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Room = () => {
  const searchParams = usePathname();
  const name = useSearchParams().get("name") || "Anonymous";
  const [gameState, setGameState] = React.useState(initialGameState());
  const [user, setUser] = React.useState<{
    id: string;
    name: string;
    isImposter: boolean;
    isAdmin: boolean;
  }>({
    id: "",
    name,
    isAdmin: false,
    isImposter: false,
  });
  const [admin, setAdmin] = useState<User | null>(null);

  console.log("Room search params:", searchParams);
  const ws = usePartySocket({
    // usePartySocket takes the same arguments as PartySocket.
    host: process.env.NEXT_PUBLIC_PARTY_KIT, // or localhost:1999 in dev
    room: searchParams.split("/")[2] || "default-room",
    party: searchParams.split("/")[1] || "default-party",
    // in addition, you can provide socket lifecycle event handlers
    // (equivalent to using ws.addEventListener in an effect hook)
    onOpen() {
      console.log("connected");
      ws.send(
        JSON.stringify({ type: "UPDATE_NAME", payload: { id: ws.id, name } })
      );
    },
    onMessage(e) {
      const data = JSON.parse(e.data);
      console.log(data);
      if (data.action in GameUpdaterAction) {
        setGameState(data.gameState);
      }
      if (data.action === "UPDATE_NAME") {
        ws.send(JSON.stringify({ type: "GET_ADMIN", payload: { id: ws.id } }));
      }
      if (data.action === "GET_ADMIN") {
        const admin = data.value;
        setAdmin(admin);
      }
      if (data.gameState) {
        const me = data.gameState.users.filter((e: User) => e.id === ws.id)[0];
        console.log(me);
        setUser(me);
      }
    },
    onClose() {
      console.log("closed");
    },
    onError(e) {
      console.log("error");
    },
  });

  const handleStart = () => {
    ws.send(JSON.stringify({ type: "NEW_ROUND", payload: { id: ws.id } }));
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(searchParams.split("/")[2]);
    toast("Copied!", {
      description: "Room code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header Info */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">
            Imposter Game
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="font-mono bg-primary/20 px-3 py-1 rounded-full">
              {searchParams.split("/")[2]}
            </span>
            <button
              onClick={handleCopyRoomCode}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Copy room code"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Game Card */}
        <div className="grid md:grid-cols-4 gap-4">
          {/* Player Info */}
          <Card className="md:col-span-2 border-2">
            <CardContent className="space-y-4">
              <div className="pt-4 border-t space-y-2">
                {user.isImposter ? (
                  <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Mask className="w-5 h-5 text-red-500" />
                      <span className="font-bold text-red-500">
                        YOU ARE THE IMPOSTER
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Figure out the word to win!
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                    The secret word is:{" "}
                    <span className="font-bold text-green-500">
                      {" "}
                      {gameState.word}
                    </span>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-semibold">Game Logs</h2>
                  <div className="max-h-40 overflow-y-auto mt-2 p-2 bg-muted/50 rounded-lg border">
                    {gameState.logs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No logs yet.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {gameState.logs.map((log, index) => (
                          <li key={index} className="text-sm">
                            {log}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players List */}
          <Card className="md:col-span-2 border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <CardTitle>Players ({gameState.users.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gameState.users.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{player.name}</p>
                      {player.id === admin?.id && (
                        <Badge variant="secondary" className="mt-1">
                          Admin
                        </Badge>
                      )}
                      {player.id === user.id && (
                        <Badge variant="outline" className="mt-1">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Instructions */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Regular Players:</span> You know
              the secret word. Try to figure out who the imposter is!
            </p>
            <p>
              <span className="font-semibold">Imposter:</span> You {"don't"}{" "}
              know the word. Listen carefully and try to guess it without
              getting caught!
            </p>
            <p className="text-muted-foreground">
              Use discussion and voting to eliminate the imposter.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-2 w-full">
          {/* Leave Button */}
          {user.isAdmin && (
            <Button
              onClick={handleStart}
              className="flex-1"
              disabled={gameState.users.length < 2}
            >
              <CirclePlay className="mr-2 w-4 h-4" />
              Start Game
            </Button>
          )}
          <Button
            onClick={() => window.location.replace("/")}
            variant="outline"
          >
            <LogOut className="mr-2 w-4 h-4" />
            Leave Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Room;
