<script lang="ts">
	import type { ChatMessage } from '$lib/websocket';
	import { fade } from 'svelte/transition';

	export let message: ChatMessage;

	// Format timestamp
	function formatTime(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	// Determine message class based on type and sender
	$: messageClass =
		message.type === 'system' ? 'system' : message.sender === 'me' ? 'outgoing' : 'incoming';

	// Show timestamp if available
	$: timeString = message.timestamp ? formatTime(message.timestamp) : '';
</script>

<div class="message {messageClass}" transition:fade={{ duration: 150 }}>
	{#if message.type === 'system'}
		<div class="content system">
			<span class="text">{message.message}</span>
			{#if timeString}
				<span class="time">{timeString}</span>
			{/if}
		</div>
	{:else}
		<div class="content">
			<span class="text">{message.message}</span>
			{#if timeString}
				<span class="time">{timeString}</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.message {
		margin: 8px 0;
		display: flex;
	}

	.content {
		padding: 10px 14px;
		border-radius: 18px;
		max-width: 80%;
		word-wrap: break-word;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.outgoing {
		justify-content: flex-end;
	}

	.outgoing .content {
		background-color: #0084ff;
		color: white;
		margin-left: auto;
		border-bottom-right-radius: 4px;
	}

	.incoming .content {
		background-color: #f1f0f0;
		color: #333;
		margin-right: auto;
		border-bottom-left-radius: 4px;
	}

	.system .content {
		background-color: transparent;
		color: #888;
		text-align: center;
		margin: 0 auto;
		font-style: italic;
		font-size: 0.9em;
	}

	.time {
		font-size: 0.7em;
		opacity: 0.7;
		margin-top: 4px;
		align-self: flex-end;
	}
</style>
