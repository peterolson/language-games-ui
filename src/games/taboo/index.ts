import type { Game } from '../games.types';
import Summary from './summary.svelte';
import Controller from './controller.svelte';

const game: Game = {
	key: 'taboo',
	supportedLocales: '*',
	Summary,
	Controller
};

export default game;
