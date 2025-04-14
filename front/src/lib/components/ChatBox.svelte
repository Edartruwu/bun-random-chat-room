<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { messages } from '$lib/websocket';
	import ChatMessage from './ChatMessage.svelte';

	let chatContainer: HTMLElement;

	// Auto-scroll to bottom when new messages arrive
	afterUpdate(() => {
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});

	onMount(() => {
		// Initial scroll to bottom
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});
</script>

<div class="chat-box" bind:this={chatContainer}>
	{#if $messages.length === 0}
		<div class="empty-state">
			<p>No messages yet. Connect to start chatting!</p>
		</div>
	{:else}
		{#each $messages as message (message.timestamp)}
			<ChatMessage {message} />
		{/each}
	{/if}
</div>

<style>
	.chat-box {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		scroll-behavior: smooth;
		background-color: #f5f5f5;
		border-radius: 8px 8px 0 0;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.empty-state {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #888;
		font-style: italic;
		text-align: center;
	}
</style>
