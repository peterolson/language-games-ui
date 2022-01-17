<script lang="ts">
	import { page } from '$app/stores';
	import { getLanguageByCode, isRTL } from '../../data/languages';
	import { _ } from 'svelte-i18n';
	import { onDestroy } from 'svelte';
	import { getSocket } from '../../data/socket';
	import type { Socket } from 'socket.io-client';
	import UserMedia from './_userMedia.svelte';
	import StreamView from './streamView.svelte';
	import { Spinner } from 'sveltestrap';
	import { connectToPeers } from './connectPeers';
	import type { Listener } from './connectPeers';
	import PlayersView from './_playersView.svelte';
	import Chat from './_chat.svelte';
	import { games as gamesData } from '../../games';
	import { locale } from 'svelte-i18n';

	const { lang } = $page.params;
	const { code, name: languageName } = getLanguageByCode(lang);
	const room = code.split('-')[0];

	let selectingMedia = true;
	let lookingForPlayers = false;
	let connectingToPeers = false;
	let isConnected = false;
	let socket: Socket;
	let userName: string;
	let userTracks: MediaStreamTrack[];
	let cleanup: () => void;
	let addMessageListener: (listener: Listener) => void;
	let sendMessage: (message: unknown) => void;
	let remoteTracks: Record<string, MediaStreamTrack[]>;
	let playerNames: Record<string, string>;
	let selfId: string;
	let game: string;
	let minPlayers: number;
	let playerCount: number;
	let unreadChatMessages: number = 0;
	let selectedTab = 'game';
	let roomId: string;
	let GameController;

	function lookForPlayers() {
		lookingForPlayers = true;
		getSocket((s) => {
			socket = s;
			socket.emit('playqueue.add', {
				lang: room,
				name: userName
			});

			socket.once('game-joined', onJoinGame);
		});
	}

	function onDisconnected(id: string) {
		playerCount--;
		if (playerCount < minPlayers) {
			cleanup();
			isConnected = false;
			connectingToPeers = false;
			lookForPlayers();
		}
	}

	async function onJoinGame(args) {
		lookingForPlayers = false;
		connectingToPeers = true;
		const { peerIds, room } = args;
		playerNames = args.playerNames;
		selfId = args.selfId;
		game = args.game;
		playerCount = args.playerCount;
		minPlayers = args.minPlayers;
		unreadChatMessages = 0;
		roomId = room;
		({ remoteTracks, cleanup, addMessageListener, sendMessage } = await connectToPeers(
			socket,
			userTracks,
			selfId,
			peerIds,
			playerNames,
			room,
			onAllConnected,
			onDisconnected,
			(tracks) => {
				remoteTracks = tracks;
			}
		));
		addMessageListener((_id: string, message: any) => {
			if (message?.type === 'chat' && selectedTab !== 'chat' && game !== 'chat') {
				unreadChatMessages++;
			}
		});
	}

	function onAllConnected() {
		connectingToPeers = false;
		isConnected = true;
		const gameObject = gamesData.find((g) => g.key === game);
		GameController = gameObject.Controller;
	}

	onDestroy(() => {
		if (socket) {
			socket.off('game-joined', onJoinGame);
		}
		if (cleanup) cleanup();
		if (userTracks) {
			userTracks.forEach((track) => track.stop());
		}
	});

	function onSelectedMedia(tracks: MediaStreamTrack[], name: string) {
		userName = name;
		userTracks = tracks;
		selectingMedia = false;
		lookForPlayers();
	}

	const selectTab = (tab: string) => () => {
		selectedTab = tab;
		if (tab === 'chat') {
			unreadChatMessages = 0;
		}
	};
</script>

<svelte:head>
	<title>{languageName} {$_('site.title')}</title>
</svelte:head>

<div class="container bg-white" class:rtl={isRTL($locale)}>
	<nav>
		<a href="/">{$_('home')}</a>
	</nav>
	<div class="game">
		{#if selectingMedia}
			<UserMedia {onSelectedMedia} onSetTracks={(tracks) => (userTracks = tracks)} />
		{:else if lookingForPlayers}
			<div class="waiting">
				<p>{$_('game.waiting')}</p>
				<Spinner color="primary" />
				<br />
				<br />
				<div class="videoPreview">
					<StreamView tracks={userTracks} name={userName} isSelfVideo={true} />
				</div>
			</div>
		{:else}
			<PlayersView {remoteTracks} {playerNames} {selfId} {userTracks}>
				{#if connectingToPeers}
					<div class="waiting">
						<p>{$_('game.connecting')}</p>
						<Spinner color="primary" />
					</div>
				{:else if isConnected}
					<div class="gameTabs">
						{#if game !== 'chat'}
							<ul class="nav nav-tabs">
								<li class="nav-item">
									<button
										class="nav-link"
										class:active={selectedTab === 'game'}
										on:click={selectTab('game')}
									>
										{$_(`${game}.name`)}
									</button>
								</li>
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
							</ul>
						{/if}
						<div class="tabContent">
							<div class:hidden={selectedTab !== 'chat' && game !== 'chat'}>
								<Chat {playerNames} {selfId} {addMessageListener} {sendMessage} />
							</div>
							<div class:hidden={game === 'chat' || selectedTab !== 'game'}>
								<svelte:component
									this={GameController}
									room={roomId}
									{playerNames}
									{selfId}
									{addMessageListener}
									{sendMessage}
								/>
							</div>
						</div>
					</div>
				{/if}
			</PlayersView>
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		border: 1px solid #ccc;
	}
	nav {
		display: flex;
		padding: 0 8px;
	}
	.nav {
		margin-bottom: 8px;
	}

	.waiting {
		text-align: center;
	}
	.videoPreview {
		height: calc(100vh - 200px);
	}

	.rtl {
		direction: rtl;
	}
	.game {
		flex-grow: 1;
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
