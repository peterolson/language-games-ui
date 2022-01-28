import type { Socket } from 'socket.io-client';
import type { Room } from 'twilio-video';

export type RoomSettings = {
	isPublic: boolean;
	useVideo: boolean;
	name: string;
	tracks: MediaStreamTrack[];
	peerIds: string[];
	playerNames: Record<string, string>;
	room: string;
	selfId: string;
	socket: Socket;
	roomCode: string;
	onLeave: (args: { id: string; playerIds: string[]; twilioRoom?: Room }) => void;
};
