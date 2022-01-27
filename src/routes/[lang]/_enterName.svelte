<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { FormGroup, Input, Label } from 'sveltestrap';
	import type { RoomSettings } from './roomSettings.types';
	import { nameStore } from '../../data/stores';
	export let onSetSettings: (settings: Partial<RoomSettings>) => void;

	nameStore.subscribe((name) => {
		onSetSettings({ name });
	});
</script>

<div>
	<FormGroup>
		<div class="h4">
			<Label for="name">{$_('game.nameInput')}</Label>
		</div>
		<Input id="name" bind:value={$nameStore} required placeholder={$_('game.namePlaceholder')} />
	</FormGroup>
</div>
