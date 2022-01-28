<script lang="ts">
	import { getSocket } from '../../data/socket';

	import { onMount } from 'svelte';

	import { _ } from 'svelte-i18n';

	import { Spinner } from 'sveltestrap';

	import type { RoomSettings } from './roomSettings.types';
	import StreamView from './streamView.svelte';

	export let settings: Partial<RoomSettings>;
	export let onSetSettings: (settings: Partial<RoomSettings>) => void;
	export let langRoom: string;
	export let lang: string;

	let isRoomFull = false;

	onMount(() => {
		getSocket((socket) => {
			onSetSettings({ socket });
			socket.emit('playqueue.add', {
				lang: langRoom,
				name: settings.name,
				isPublic: settings.isPublic,
				useVideo: settings.useVideo,
				room: settings.roomCode
			});
			socket.on('room-full', () => {
				isRoomFull = true;
			});
			socket.on('room-joined', ({ peerIds, playerNames, room, selfId }) => {
				isRoomFull = false;
				onSetSettings({
					peerIds: peerIds.filter((peerId) => peerId !== selfId),
					playerNames,
					room,
					selfId
				});
			});
			socket.on('player-joined', ({ playerId, playerName }) => {
				onSetSettings({
					peerIds: [...settings.peerIds, playerId],
					playerNames: {
						...settings.playerNames,
						[playerId]: playerName
					}
				});
			});

			function onLeave({ id, playerIds, twilioRoom }) {
				const peerIds = playerIds.filter((x) => x !== id && x !== settings.selfId);
				onSetSettings({
					peerIds,
					playerNames: {
						...settings.playerNames,
						[id]: undefined
					}
				});
				if (peerIds.length === 0) {
					socket.emit('playqueue.remove');
					twilioRoom?.disconnect();
					setTimeout(() => {
						socket.emit('playqueue.add', {
							lang: langRoom,
							name: settings.name,
							isPublic: settings.isPublic,
							room: settings.roomCode,
							useVideo: settings.useVideo
						});
					}, 1000);
				}
			}
			socket.on('user:leave', onLeave);
			onSetSettings({
				onLeave
			});
		});
	});

	function getURL(room) {
		return `${window.location.origin}/${lang}?room=${room}`;
	}
</script>

<div class="text-center">
	{#if isRoomFull}
		<div class="alert alert-danger">
			<h4 class="alert-heading-text">{$_('game.roomFull')}</h4>
		</div>
	{:else}
		<p class="lead">{$_('game.waiting')}</p>
		<Spinner color="primary" />
	{/if}
	{#if !settings.isPublic && settings.room}
		<div class="lead">{$_('game.roomNumber')}</div>
		<div class="h1 font-monospace">{settings.room}</div>
		<div class="input-group">
			<span class="input-group-text" id="link-label">{$_('game.link')}</span>
			<input
				type="text"
				class="form-control"
				value={getURL(settings.room)}
				aria-label="Link"
				aria-describedby="link-label"
			/>
		</div>
	{/if}

	{#if settings.tracks}
		<div class="mt-2">
			<StreamView
				tracks={settings.tracks}
				name={settings.name}
				isSelfVideo={true}
				soloView={true}
			/>
		</div>
	{/if}
</div>
