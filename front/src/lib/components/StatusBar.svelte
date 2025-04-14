<script lang="ts">
	import { connectionState, connect, disconnect, clearMessages } from '$lib/websocket';

	// Status text based on connection state
	$: statusText = getStatusText($connectionState);

	// Status color based on connection state
	$: statusColor = getStatusColor($connectionState);

	// Helper to get status text
	function getStatusText(state: string): string {
		switch (state) {
			case 'disconnected':
				return 'Disconnected';
			case 'connecting':
				return 'Connecting...';
			case 'waiting':
				return 'Waiting for a partner...';
			case 'connected':
				return 'Connected - Chat active';
			default:
				return 'Unknown status';
		}
	}

	// Helper to get status color
	function getStatusColor(state: string): string {
		switch (state) {
			case 'disconnected':
				return '#ea4335'; // Red
			case 'connecting':
				return '#fbbc05'; // Yellow
			case 'waiting':
				return '#fbbc05'; // Yellow
			case 'connected':
				return '#34a853'; // Green
			default:
				return '#cccccc';
		}
	}

	// Handle connect/disconnect actions
	function handleConnectionToggle() {
		if ($connectionState === 'disconnected') {
			connect();
		} else {
			disconnect();
		}
	}

	// Handle clear chat
	function handleClearChat() {
		clearMessages();
	}
</script>

<div class="status-bar">
	<div class="status">
		<div class="status-indicator" style="background-color: {statusColor}"></div>
		<span class="status-text">{statusText}</span>
	</div>

	<div class="actions">
		<button class="clear-btn" on:click={handleClearChat}> Clear Chat </button>

		<button
			class="connection-btn"
			class:connect={$connectionState === 'disconnected'}
			class:disconnect={$connectionState !== 'disconnected'}
			on:click={handleConnectionToggle}
		>
			{$connectionState === 'disconnected' ? 'Connect' : 'Disconnect'}
		</button>
	</div>
</div>

<style>
	.status-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background-color: white;
		border-bottom: 1px solid #e0e0e0;
		border-radius: 8px 8px 0 0;
	}

	.status {
		display: flex;
		align-items: center;
	}

	.status-indicator {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		margin-right: 8px;
	}

	.status-text {
		font-size: 0.9rem;
		font-weight: 500;
	}

	.actions {
		display: flex;
		gap: 10px;
	}

	button {
		padding: 8px 16px;
		border-radius: 4px;
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: all 0.2s;
	}

	.clear-btn {
		background-color: #f5f5f5;
		color: #555;
	}

	.clear-btn:hover {
		background-color: #e8e8e8;
	}

	.connection-btn.connect {
		background-color: #0084ff;
		color: white;
	}

	.connection-btn.connect:hover {
		background-color: #0073df;
	}

	.connection-btn.disconnect {
		background-color: #ea4335;
		color: white;
	}

	.connection-btn.disconnect:hover {
		background-color: #d32f2f;
	}
</style>
