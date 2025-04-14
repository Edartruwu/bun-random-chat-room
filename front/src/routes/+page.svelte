<script lang="ts">
	import { onDestroy } from 'svelte';
	import ChatBox from '$lib/components/ChatBox.svelte';
	import ChatControls from '$lib/components/ChatControls.svelte';
	import StatusBar from '$lib/components/StatusBar.svelte';
	import { disconnect } from '$lib/websocket';

	// Clean up WebSocket connection when component is destroyed
	onDestroy(() => {
		disconnect();
	});
</script>

<svelte:head>
	<title>Random Chat</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Random Chat</h1>
		<p>Chat with randomly matched partners</p>
	</header>

	<main>
		<div class="chat-container">
			<StatusBar />
			<ChatBox />
			<ChatControls />
		</div>
	</main>

	<footer>
		<p>Connect to chat with a random stranger. Be kind and respectful!</p>
	</footer>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	header {
		text-align: center;
		margin-bottom: 20px;
	}

	h1 {
		margin-bottom: 5px;
		color: #0084ff;
	}

	header p {
		color: #666;
		margin: 0;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.chat-container {
		display: flex;
		flex-direction: column;
		height: 600px;
		max-height: 70vh;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		overflow: hidden;
	}

	footer {
		margin-top: 20px;
		text-align: center;
		font-size: 0.9rem;
		color: #888;
	}
</style>
