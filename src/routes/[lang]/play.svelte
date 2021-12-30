<script lang="ts">
	import { page } from '$app/stores';
	import { parseLang } from '../../data/languages';
	import { _ } from 'svelte-i18n';
	import { onDestroy, onMount } from 'svelte';
	import { getSocket } from '../../data/socket';
	import type { Socket } from 'socket.io-client';
	import UserMedia from './_userMedia.svelte';
	import StreamView from './streamView.svelte';
	import { Spinner } from 'sveltestrap';
	import { connectToPeers } from './connectPeers';
	import PlayersView from './_playersView.svelte';

	const query = $page.query;
	const games = query.get('games').split(',');
	const { lang } = $page.params;
	const { room, langCode, language } = parseLang(lang);

	let selectingMedia = true;
	let lookingForPlayers = false;
	let connectingToPeers = false;
	let isConnected = false;
	let socket: Socket;
	let userName: string;
	let userStream: MediaStream;
	let cleanup: () => void;
	let peers: Record<string, RTCPeerConnection>;
	let remoteStreams: Record<string, MediaStream>;
	let playerNames: Record<string, string>;
	let selfId: string;
	let game: string;

	function lookForPlayers() {
		lookingForPlayers = true;
		getSocket((s) => {
			socket = s;
			socket.emit('playqueue.add', {
				lang: room,
				games,
				name: userName
			});

			socket.once('game-joined', onJoinGame);
		});
	}

	async function onJoinGame(args) {
		lookingForPlayers = false;
		connectingToPeers = true;
		const { peerIds, playerCount, room } = args;
		playerNames = args.playerNames;
		selfId = args.selfId;
		game = args.game;
		({ peers, remoteStreams, cleanup } = await connectToPeers(
			socket,
			userStream,
			selfId,
			peerIds,
			playerNames,
			room,
			onAllConnected
		));
	}

	function onAllConnected() {
		connectingToPeers = false;
		isConnected = true;
	}

	onDestroy(() => {
		if (!socket) return;
		socket.off('game-joined', onJoinGame);
		if (cleanup) cleanup();
	});

	function onSelectedMedia(stream: MediaStream, name: string) {
		userName = name;
		userStream = stream;
		selectingMedia = false;
		lookForPlayers();
	}
</script>

<div class="container" class:rtl={language.rtl}>
	<nav>
		<a href="/">{$_('home')}</a>&nbsp;/&nbsp;
		<a href={`/${lang}`}>{language.name}</a>&nbsp;/&nbsp;
		{(game ? [game] : games).map((game) => $_(`${game}.name`)).join(', ')}
	</nav>
	<div class="game">
		{#if selectingMedia}
			<UserMedia {onSelectedMedia} />
		{:else if lookingForPlayers}
			<div class="waiting">
				<p>{$_('game.waiting')}</p>
				<Spinner color="primary" />
				<br />
				<br />
				<div class="videoPreview">
					<StreamView stream={userStream} isSelfVideo name={userName} />
				</div>
			</div>
		{:else}
			<PlayersView {remoteStreams} {playerNames} {selfId}>
				{#if connectingToPeers}
					<div class="waiting">
						<p>{$_('game.connecting')}</p>
						<Spinner color="primary" />
					</div>
				{:else if isConnected}
					Game goes here!
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
	}
	nav {
		display: flex;
		padding: 0 8px;
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
</style>
