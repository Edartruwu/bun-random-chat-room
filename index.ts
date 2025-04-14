import type { Server, WebSocketHandler, ServerWebSocket } from "bun";

// Define types for better type safety
interface ClientData {
  id: string;
  partner: ServerWebSocket<ClientData> | null;
}

interface ChatRoom {
  id: string;
  client1: ServerWebSocket<ClientData>;
  client2: ServerWebSocket<ClientData>;
}

interface ChatMessage {
  type: "chat" | "system";
  message: string;
}

// Store waiting clients (not yet matched)
let waitingClient: ServerWebSocket<ClientData> | null = null;

// Store active chat rooms
const chatRooms = new Map<string, ChatRoom>();

// WebSocket handler
const webSocketHandler: WebSocketHandler<ClientData> = {
  open(ws: ServerWebSocket<ClientData>): void {
    // Generate a unique ID for the new client
    const clientId = Bun.randomUUIDv7();

    // Initialize client data
    ws.data = {
      id: clientId,
      partner: null,
    };

    console.log(`Client connected: ${clientId}`);

    // Send welcome message to the client
    sendSystemMessage(ws, `Welcome! Your ID is ${clientId.slice(0, 8)}...`);

    // If there's a waiting client, match them together
    if (waitingClient && waitingClient.readyState === WebSocket.OPEN) {
      // Create a new chat room
      const roomId = Bun.randomUUIDv7();

      // Update client data with their partners
      ws.data.partner = waitingClient;
      waitingClient.data.partner = ws;

      // Store the chat room
      chatRooms.set(roomId, {
        id: roomId,
        client1: ws,
        client2: waitingClient,
      });

      // Notify both clients that they've been matched
      sendSystemMessage(
        ws,
        `You've been matched with a partner! Start chatting.`,
      );
      sendSystemMessage(
        waitingClient,
        `You've been matched with a partner! Start chatting.`,
      );

      console.log(
        `Room created: ${roomId} with clients ${clientId} and ${waitingClient.data.id}`,
      );

      // Clear the waiting client
      waitingClient = null;
    } else {
      // No waiting client, so this client becomes the waiting client
      waitingClient = ws;
      sendSystemMessage(ws, `Waiting for a partner to join...`);
    }
  },

  message(ws: ServerWebSocket<ClientData>, message: string | Buffer): void {
    try {
      // Parse the message
      const data = JSON.parse(message.toString()) as ChatMessage;

      // If this is a chat message and the client has a partner, forward the message
      if (
        data.type === "chat" &&
        ws.data.partner &&
        ws.data.partner.readyState === WebSocket.OPEN
      ) {
        ws.data.partner.send(
          JSON.stringify({
            type: "chat",
            message: data.message,
          } as ChatMessage),
        );
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  },

  close(ws: ServerWebSocket<ClientData>): void {
    console.log(`Client disconnected: ${ws.data.id}`);

    // If this client is the waiting client, clear the waiting client
    if (waitingClient === ws) {
      waitingClient = null;
    }

    // If this client has a partner, notify the partner
    if (ws.data.partner && ws.data.partner.readyState === WebSocket.OPEN) {
      sendSystemMessage(ws.data.partner, "Your chat partner has disconnected.");

      // The partner becomes the waiting client
      waitingClient = ws.data.partner;
      ws.data.partner.data.partner = null;

      sendSystemMessage(waitingClient, "Waiting for a new partner to join...");
    }

    // Remove client from rooms
    for (const [roomId, room] of chatRooms.entries()) {
      if (room.client1 === ws || room.client2 === ws) {
        chatRooms.delete(roomId);
        console.log(`Room closed: ${roomId}`);
        break;
      }
    }
  },

  drain(ws: ServerWebSocket<ClientData>): void {
    // Optional: Handle backpressure if needed
    console.log(`Backpressure relieved for client: ${ws.data.id}`);
  },
};

// Helper function to send system messages
function sendSystemMessage(
  ws: ServerWebSocket<ClientData>,
  message: string,
): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: "system",
        message: message,
      } as ChatMessage),
    );
  }
}

// Create and start the server
const server: Server = Bun.serve({
  port: 3000,
  fetch(req, server) {
    // Only handle WebSocket upgrade requests
    if (server.upgrade(req)) {
      return; // Request was upgraded, no response needed
    }

    // For regular HTTP requests, return a simple message
    return new Response(
      "WebSocket server running. Connect with a WebSocket client.",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
  },
  websocket: webSocketHandler,
});

console.log(
  `Random chat WebSocket server is running on ws://localhost:${server.port}`,
);
