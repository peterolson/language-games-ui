<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getLanguageByCode, isRTL } from '../../data/languages';

	import { locale, _ } from 'svelte-i18n';

	import { Icon } from 'sveltestrap';
	import type { RoomSettings } from './roomSettings.types';

	import ChooseRoomType from './_chooseRoomType.svelte';
	import EnterName from './_enterName.svelte';
	import UserMedia from './_userMedia.svelte';
	import ConnectToRoom from './_connectToRoom.svelte';
	import { getSocket } from '../../data/socket';
	import RoomView from './_roomView.svelte';

	const { lang } = $page.params;
	const { code, name: languageName } = getLanguageByCode(lang);
	const langRoom = code.split('-')[0];

	const query = $page.query;
	const roomCode = query.get('room');

	let settings: Partial<RoomSettings> = {
		roomCode,
		isPublic: roomCode ? false : true,
		useVideo: roomCode ? roomCode.startsWith('V') : true
	};

	let isRoomTypeSelected = !!roomCode;
	let hasName = false;
	let hasMedia = false;
	let connectedToRoom = false;

	function onSetSettings(updates: Partial<RoomSettings>) {
		settings = { ...settings, ...updates };
		connectedToRoom = settings?.room && settings?.peerIds?.length > 0;
	}

	function back() {
		if (!isRoomTypeSelected) {
			goto('/');
			return;
		}
		if (!hasName) {
			isRoomTypeSelected = false;
			return;
		}
		if (!hasMedia && settings.useVideo) {
			hasName = false;
			settings.tracks?.forEach((track) => track.stop());
			delete settings.tracks;
			settings = settings;
			return;
		}
		if (!connectedToRoom) {
			hasMedia = false;
			if (!settings.useVideo) {
				hasName = false;
			}
			getSocket((socket) => {
				socket.emit('playqueue.remove');
				socket.off('room-joined');
				socket.off('player-joined');
				socket.off('user:leave');
			});
			return;
		}
	}

	function next() {
		if (!isRoomTypeSelected) {
			isRoomTypeSelected = true;
			return;
		}
		if (!hasName) {
			hasName = true;
			return;
		}
		if (!hasMedia && settings.useVideo) {
			hasMedia = true;
			return;
		}
	}
</script>

<svelte:head>
	<title>{$_('site.title')} - {languageName}</title>
</svelte:head>

<div class="wizard bg-white p-4" class:hidden={connectedToRoom} class:rtl={isRTL($locale)}>
	<div class="h3">{languageName}</div>
	{#if !isRoomTypeSelected}
		<ChooseRoomType {onSetSettings} {settings} />
	{:else if !hasName}
		<EnterName {onSetSettings} />
	{:else if !hasMedia && settings.useVideo}
		<UserMedia {onSetSettings} {settings} />
	{:else}
		<ConnectToRoom {settings} {langRoom} {onSetSettings} {lang} />
	{/if}
	<div class="row mt-4">
		<button class="btn btn-secondary col m-1" on:click={back}>
			<Icon name={isRTL($locale) ? 'chevron-right' : 'chevron-left'} />
			&nbsp;{$_('navigate.back')}
		</button>
		{#if settings.useVideo ? !hasMedia : !hasName}
			<button
				class="btn btn-primary col m-1"
				on:click={next}
				disabled={(isRoomTypeSelected && !settings.name) ||
					(hasName && !settings.tracks && settings.useVideo)}
			>
				{$_('navigate.next')}&nbsp;
				<Icon name={isRTL($locale) ? 'chevron-left' : 'chevron-right'} />
			</button>
		{/if}
	</div>
</div>

{#if connectedToRoom}
	<RoomView {settings} />
{/if}

<style>
	.wizard {
		max-width: 640px;
		margin: auto;
		border: 1px solid #ccc;
	}

	.hidden {
		display: none;
	}

	.rtl {
		direction: rtl;
	}
</style>
