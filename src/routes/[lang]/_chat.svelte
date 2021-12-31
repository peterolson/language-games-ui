<script lang="ts">
	import { colorFromString } from '../../data/color';

	import { onMount } from 'svelte';

	import type { Listener } from './connectPeers';
	import { _ } from 'svelte-i18n';

	export let addMessageListener: (listener: Listener) => void;
	export let sendMessage: (message: unknown) => void;
	export let playerNames: Record<string, string>;
	export let selfId: string;
	let messages: { from: string; message: string; timestamp: number }[] = [];
	let message = '';
	let messagesBox: HTMLDivElement;

	onMount(() => {
		addMessageListener((from, message: { type?: string; message: string; timestamp: number }) => {
			if (message?.type === 'chat') {
				messages.push({ from, message: message.message, timestamp: message.timestamp });
				messages = messages;
			}
		});
	});

	function onSend(e: Event) {
		e.preventDefault();
		sendMessage({ type: 'chat', message });
		messages.push({ from: selfId, message, timestamp: Date.now() });
		message = '';
		messages = messages;
	}
</script>

<div class="chatContainer">
	<div class="messages" bind:this={messagesBox}>
		<div>
			{#each messages as message, i}
				<div class="messageContainer" class:self={message.from === selfId}>
					<div class="message">
						{#if messages[i - 1]?.from !== message.from}
							<strong style={`color:${colorFromString(message.from)}`}>
								{playerNames[message.from]}
							</strong>
						{/if}
						<div>
							&nbsp;
							{message.message}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<form on:submit={onSend}>
		<input type="text" bind:value={message} />
		<button type="submit" class="btn btn-primary" disabled={!message}>{$_('chat.send')}</button>
	</form>
</div>

<style>
	.chatContainer {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	form {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	form input {
		width: 100%;
		padding: 4px 0;
		margin-inline-end: 4px;
	}
	form button {
		white-space: nowrap;
	}

	.messages {
		flex-grow: 1;
		overflow-y: auto;
		flex-basis: 0;
		display: flex;
		flex-direction: column-reverse;
	}

	.messageContainer {
		width: 100%;
	}

	.message {
		border-radius: 0.25rem;
		border: 1px solid #ccc;
		padding: 0.25rem 0.5rem;
		margin: 0.25rem;
		display: inline-block;
		max-width: 100%;
		box-sizing: border-box;
	}
	.self {
		text-align: end;
	}
</style>
