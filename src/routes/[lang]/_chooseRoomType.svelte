<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { RoomSettings } from './roomSettings.types';

	export let onSetSettings: (settings: Partial<RoomSettings>) => void;

	let roomVisibility = 'public';
	let videoConnection = 'present';
	let roomCode = '';

	$: {
		const isPublic = roomVisibility === 'public';
		onSetSettings({
			isPublic: roomVisibility === 'roomCode' ? false : isPublic,
			useVideo:
				roomVisibility === 'roomCode'
					? roomCode.startsWith('V')
					: isPublic || videoConnection === 'absent',
			roomCode: roomVisibility === 'roomCode' ? roomCode.toUpperCase().trim() : undefined
		});
	}
</script>

<div>
	<div class="form-check h4 m-2">
		<input
			class="form-check-input"
			type="radio"
			name="roomVisibility"
			value="public"
			id="radPublic"
			bind:group={roomVisibility}
		/>
		<label class="form-check-label" for="radPublic">
			{$_('roomType.publicRoom')}
			<div class="lead">{$_('roomType.publicRoomHint')}</div>
		</label>
	</div>
	<div class="form-check h4 m-2">
		<input
			class="form-check-input"
			type="radio"
			name="roomVisibility"
			value="private"
			bind:group={roomVisibility}
			id="radPrivate"
		/>
		<label class="form-check-label" for="radPrivate">
			{$_('roomType.privateRoom')}
			<div class="lead">{$_('roomType.privateRoomHint')}</div>
			{#if roomVisibility === 'private'}
				<div class="form-check h5 m-2">
					<input
						class="form-check-input"
						type="radio"
						name="videoConnection"
						value="present"
						bind:group={videoConnection}
						id="radPresent"
					/>
					<label class="form-check-label" for="radPresent">
						{$_('roomType.alreadyConnected')}
						<div class="lead">{$_('roomType.alreadyConnectedHint')}</div>
					</label>
				</div>
				<div class="form-check h5 m-2">
					<input
						class="form-check-input"
						type="radio"
						name="videoConnection"
						value="absent"
						bind:group={videoConnection}
						id="radAbsent"
					/>
					<label class="form-check-label" for="radAbsent">
						{$_('roomType.connectVideo')}
						<div class="lead">{$_('roomType.connectVideoHint')}</div>
						<div class="h6">{$_('roomType.connectVideoMax')}</div>
					</label>
				</div>
			{/if}
		</label>
	</div>
	<div class="form-check h4 m-2">
		<input
			class="form-check-input"
			type="radio"
			name="roomVisibility"
			value="roomCode"
			id="radRoomCode"
			bind:group={roomVisibility}
		/>
		<label class="form-check-label" for="radRoomCode">
			{$_('roomType.roomCode')}
			{#if roomVisibility === 'roomCode'}
				<div class="form-group">
					<input bind:value={roomCode} type="text" class="lead font-monospace" />
				</div>
			{/if}
		</label>
	</div>
</div>
