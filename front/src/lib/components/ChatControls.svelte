<script lang="ts">
	import { sendMessage, canSendMessages } from '$lib/websocket';

	let messageText = '';

	function handleSubmit() {
		if (messageText.trim() === '') return;

		if (sendMessage(messageText.trim())) {
			messageText = '';
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="chat-controls">
	<textarea
		bind:value={messageText}
		on:keydown={handleKeyPress}
		placeholder="Type a message..."
		disabled={!$canSendMessages}
		class:disabled={!$canSendMessages}
	></textarea>
	<button
		on:click={handleSubmit}
		disabled={!$canSendMessages || messageText.trim() === ''}
		class:disabled={!$canSendMessages || messageText.trim() === ''}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<line x1="22" y1="2" x2="11" y2="13"></line>
			<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
		</svg>
	</button>
</div>

<style>
	.chat-controls {
		display: flex;
		padding: 10px;
		background-color: white;
		border-top: 1px solid #e0e0e0;
		border-radius: 0 0 8px 8px;
	}

	textarea {
		flex: 1;
		padding: 12px 16px;
		border: 1px solid #e0e0e0;
		border-radius: 24px;
		resize: none;
		font-family: inherit;
		font-size: 1rem;
		min-height: 24px;
		max-height: 120px;
		outline: none;
		transition: border-color 0.2s;
	}

	textarea:focus {
		border-color: #0084ff;
	}

	textarea.disabled {
		background-color: #f5f5f5;
		color: #999;
	}

	button {
		background-color: #0084ff;
		color: white;
		border: none;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 10px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	button:hover:not(.disabled) {
		background-color: #0073df;
	}

	button.disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}

	svg {
		width: 20px;
		height: 20px;
	}
</style>
