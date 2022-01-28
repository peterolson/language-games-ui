<script lang="ts">
	import { locale, _ } from 'svelte-i18n';

	import { isRTL } from '../../data/languages';

	import type { RoomSettings } from './roomSettings.types';
	import GameSelector from './simulate/_gameSelector.svelte';
	import Chat from './_chat.svelte';
	import { games as gamesData } from '../../games';
	import { connectToPeers, Listener } from './connectPeers';
	import { onDestroy, onMount } from 'svelte';
	import PlayersView from './_playersView.svelte';
	import type { LocalParticipant } from 'twilio-video';
	import { Spinner } from 'sveltestrap';

	export let settings: Partial<RoomSettings>;

	let cleanup: () => void;
	let addMessageListener: (listener: Listener) => void;
	let removeMessageListener: (listener: Listener) => void;
	let sendMessage: (message: unknown) => void;
	let remoteTracks: Record<string, MediaStreamTrack[]>;
	let localParticipant: LocalParticipant;
	let game = 'chat';
	let selectedTab = 'chat';
	let unreadChatMessages = 0;
	let GameController;
	let gameUniqueId = 0;
	let connectingToPeers = true;

	const selectTab = (tab: string) => () => {
		selectedTab = tab;
		if (tab === 'chat') {
			unreadChatMessages = 0;
		}
	};

	function onChooseGame(newGame: string) {
		gameUniqueId = +new Date();
		sendMessage({
			type: 'set-game',
			key: newGame,
			gameUniqueId
		});
		setGame(newGame);
	}

	function setGame(newGame: string) {
		selectedTab = newGame === 'chat' ? 'chat' : 'game';
		GameController = gamesData.find((g) => g.key === newGame).Controller;
		game = newGame;
	}

	function onAllConnected() {
		console.log('all connected');
	}

	function onDisconnected({ id, playerIds, twilioRoom }) {
		console.log('disconnected', id, playerIds);
		if (settings.onLeave) {
			settings.onLeave({ id, playerIds, twilioRoom });
		}
	}

	onMount(async () => {
		({
			remoteTracks,
			cleanup,
			addMessageListener,
			removeMessageListener,
			sendMessage,
			localParticipant
		} = await connectToPeers(
			settings.socket,
			settings.tracks,
			settings.selfId,
			settings.peerIds,
			settings.useVideo,
			settings.room,
			onAllConnected,
			onDisconnected,
			(tracks) => {
				remoteTracks = tracks;
			}
		));
		connectingToPeers = false;
		addMessageListener((_id: string, message: any) => {
			if (message?.type === 'chat' && selectedTab !== 'chat') {
				unreadChatMessages++;
			}
			if (message?.type === 'set-game') {
				gameUniqueId = message.gameUniqueId;
				setGame(message.key);
			}
		});
	});

	onDestroy(() => {
		if (cleanup) cleanup();
	});
</script>

<div class="page-container bg-white" class:rtl={isRTL($locale)}>
	<PlayersView
		{remoteTracks}
		playerNames={settings.playerNames}
		selfId={settings.selfId}
		userTracks={settings.tracks}
		{localParticipant}
	>
		{#if connectingToPeers}
			<div class="waiting">
				<p>{$_('game.connecting')}</p>
				<Spinner color="primary" />
			</div>
		{:else}
			<div class="gameTabs">
				<ul class="nav nav-tabs">
					{#if game !== 'chat'}
						<li class="nav-item">
							<button
								class="nav-link"
								class:active={selectedTab === 'game'}
								on:click={selectTab('game')}
							>
								{$_(`${game}.name`)}
							</button>
						</li>
					{/if}
					<li class="nav-item">
						<button
							class="nav-link"
							class:active={selectedTab === 'chat'}
							on:click={selectTab('chat')}
						>
							{$_('chat.name')}
							{#if unreadChatMessages > 0}
								<span class="badge badge-primary">{unreadChatMessages}</span>
							{/if}
						</button>
					</li>

					<li class="nav-item">
						<button
							class="nav-link"
							class:active={selectedTab === 'selectGame'}
							on:click={selectTab('selectGame')}
						>
							{$_(`games`)}
						</button>
					</li>
				</ul>
				<div class="tabContent">
					<div class:hidden={selectedTab !== 'chat'}>
						<Chat
							playerNames={settings.playerNames}
							selfId={settings.selfId}
							{addMessageListener}
							{sendMessage}
						/>
					</div>
					<div class:hidden={selectedTab !== 'game'}>
						{#key GameController}
							<svelte:component
								this={GameController}
								room={settings.room + gameUniqueId}
								playerNames={settings.playerNames}
								selfId={settings.selfId}
								{addMessageListener}
								{removeMessageListener}
								{sendMessage}
							/>
						{/key}
					</div>
					<div class:hidden={selectedTab !== 'selectGame'}>
						<GameSelector {onChooseGame} />
					</div>
				</div>
			</div>
		{/if}
	</PlayersView>
</div>

<style>
	.page-container {
		display: grid;
		grid-template-rows: minmax(0, 1fr);
		height: 100%;
		position: relative;
	}
	.nav {
		margin-bottom: 8px;
	}

	.waiting {
		text-align: center;
	}

	.rtl {
		direction: rtl;
	}

	.gameTabs {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.gameTabs div {
		flex-grow: 1;
		height: 100%;
	}
	.hidden {
		display: none;
	}

	.badge {
		background-color: var(--bs-primary);
	}

	.tabContent {
		height: 100%;
		overflow: auto;
		flex-basis: 0;
	}
</style>
