import chat from './chat';
import type { Game } from './games.types';
import guessWho from './guess-who';
import taboo from './taboo';
import describePicture from './describe-picture';
import codenames from './codenames';

export const games: Game[] = [chat, guessWho, taboo, describePicture, codenames];
