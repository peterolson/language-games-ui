<script lang="ts">
	import { page } from '$app/stores';
	import { games } from '../../../games';
	import { languages, parseLang } from '../../../data/languages';
	import { _ } from '../../../i18n';

	const { lang, game } = $page.params;
	const playerCount = +$page.query.get('players') || 2;
	const { room, langCode, language } = parseLang(lang);
	const { name, rtl } = language;
	const gameObject = games.find((g) => g.key === game);
	const GameController = gameObject.Controller;

	type Player = {
		id: string;
	};
	const names = ['Alice', 'Bob', 'Charlie', 'Diego'];

	const players: Player[] = [];
	const playerNames: Record<string, string> = {};
	for (let i = 0; i < playerCount; i++) {
		const id = i.toString();
		players.push({
			id
		});
		playerNames[id] = names[i % names.length];
	}

	const listenersByPlayer = {};

	const addMessageListener = (player: Player) => {
		listenersByPlayer[player.id] = [];
		return (listener) => {
			listenersByPlayer[player.id].push(listener);
		};
	};

	const sendMessage = (player: Player) => (message) => {
		for (const p of players) {
			if (p.id === player.id) {
				continue;
			}
			for (const listener of listenersByPlayer[p.id] || []) {
				setTimeout(() => {
					listener(player.id, message);
				}, 100 + Math.random() * 1000);
			}
		}
	};
</script>

<div class="players" class:rtl={language.rtl}>
	{#each players as player}
		<div>
			<GameController
				{room}
				{playerNames}
				selfId={player.id}
				addMessageListener={addMessageListener(player)}
				sendMessage={sendMessage(player)}
			/>
		</div>
	{/each}
</div>

<style>
	.players {
		display: flex;
		height: 100%;
	}

	.players div {
		flex-grow: 1;
		flex-basis: 0;
		padding: 8px;
		height: 100%;
		overflow: auto;
	}
	.rtl {
		direction: rtl;
	}
</style>
