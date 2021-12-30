import chat from './chat';
import type { Game } from './games.types';
import guessWho from './guess-who';
import snakeOil from './snake-oil';
import taboo from './taboo';

export const games: Game[] = [chat, guessWho, taboo, snakeOil];
