import { writable, derived } from 'svelte/store';

// Message types
export interface ChatMessage {
	type: 'chat' | 'system';
	message: string;
	timestamp?: number;
	sender?: 'me' | 'partner';
}

// Connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'waiting' | 'connected';

// Store for messages
export const messages = writable<ChatMessage[]>([]);

// Store for connection state
export const connectionState = writable<ConnectionState>('disconnected');

// Derived store for indicating if user can send messages
export const canSendMessages = derived(connectionState, ($state) => $state === 'connected');

// WebSocket connection
let socket: WebSocket | null = null;

// Connect to WebSocket server
export function connect(): void {
	if (socket?.readyState === WebSocket.OPEN) {
		disconnect();
	}

	connectionState.set('connecting');

	try {
		// Get WebSocket URL from environment variable
		const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8787';
		socket = new WebSocket(websocketUrl);

		socket.onopen = () => {
			addSystemMessage('Connected to server. Waiting for a chat partner...');
			connectionState.set('waiting');
		};

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data) as ChatMessage;

				if (data.type === 'system') {
					addSystemMessage(data.message);

					// Update connection state based on system message content
					if (data.message.includes('matched') || data.message.includes('Start chatting')) {
						connectionState.set('connected');
					} else if (data.message.includes('disconnected')) {
						connectionState.set('waiting');
					}
				} else if (data.type === 'chat') {
					addPartnerMessage(data.message);
				}
			} catch (error) {
				console.error('Error parsing message:', error);
				addSystemMessage('Error: Received invalid message format');
			}
		};

		socket.onclose = () => {
			addSystemMessage('Disconnected from server.');
			connectionState.set('disconnected');
		};

		socket.onerror = (error) => {
			console.error('WebSocket error:', error);
			addSystemMessage('Error: Connection problem occurred.');
			connectionState.set('disconnected');
		};
	} catch (error) {
		console.error('Failed to create WebSocket connection:', error);
		addSystemMessage('Error: Failed to connect to chat server.');
		connectionState.set('disconnected');
	}
}

// Disconnect from WebSocket server
export function disconnect(): void {
	if (socket) {
		socket.close();
		socket = null;
	}
}

// Send chat message
export function sendMessage(text: string): boolean {
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		addSystemMessage('Error: Not connected to server.');
		return false;
	}

	try {
		const message: ChatMessage = {
			type: 'chat',
			message: text
		};

		socket.send(JSON.stringify(message));
		addMyMessage(text);
		return true;
	} catch (error) {
		console.error('Error sending message:', error);
		addSystemMessage('Error: Failed to send message.');
		return false;
	}
}

// Helper function to add system message
function addSystemMessage(text: string): void {
	messages.update((msgs) => [
		...msgs,
		{
			type: 'system',
			message: text,
			timestamp: Date.now()
		}
	]);
}

// Helper function to add my message
function addMyMessage(text: string): void {
	messages.update((msgs) => [
		...msgs,
		{
			type: 'chat',
			message: text,
			timestamp: Date.now(),
			sender: 'me'
		}
	]);
}

// Helper function to add partner message
function addPartnerMessage(text: string): void {
	messages.update((msgs) => [
		...msgs,
		{
			type: 'chat',
			message: text,
			timestamp: Date.now(),
			sender: 'partner'
		}
	]);
}

// Clear messages
export function clearMessages(): void {
	messages.set([]);
}
