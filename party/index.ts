import type * as Party from "partykit/server";
import {
  GameInfo,
  GameState,
  GameUpdater,
  initialGameState,
} from "../game/logic";

export enum GameUpdaterAction {
  "ADD_USER",
  "REMOVE_USER",
  "START_GAME",
  "LOG_MESSAGE",
  "UPDATE_NAME",
  "NEW_ROUND",
}

export default class Server implements Party.Server {
  private gameState: GameState;
  constructor(readonly room: Party.Room) {
    this.gameState = initialGameState();
    console.log("Room created:", room.id);
    console.log("Room users:", this.gameState.users);
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname},
  conn:${JSON.stringify(conn.state)}`
    );
    this.gameState = GameUpdater(
      { type: "ADD_USER", payload: { id: conn.id } },
      this.gameState
    );
    console.log("Current users:", this.gameState.users);
    // let's send a message to the connection
    this.room.broadcast(
      JSON.stringify({
        gameState: this.gameState,
        action: "ADD_USER",
      })
    );
  }

  onClose(connection: Party.Connection): void | Promise<void> {
    // A websocket just disconnected!
    console.log(`Connection closed: ${connection.id}`);
    this.gameState = GameUpdater(
      { type: "REMOVE_USER", payload: connection.id },
      this.gameState
    );
    console.log("Current users:", this.gameState.users);
    this.room.broadcast(
      JSON.stringify({
        gameState: this.gameState,
        action: "REMOVE_USER",
      })
    );
  }
  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);
    if (JSON.parse(message).type in GameUpdaterAction) {
      this.gameState = GameUpdater(JSON.parse(message), this.gameState);
      console.log("Updated game state:", this.gameState);
      this.room.broadcast(
        JSON.stringify({
          gameState: this.gameState,
          action: JSON.parse(message).type,
        })
      );
    } else {
      this.room.broadcast(
        JSON.stringify({
          value: GameInfo(JSON.parse(message), this.gameState),
          action: JSON.parse(message).type,
        })
      );
    }
  }
}

Server satisfies Party.Worker;
