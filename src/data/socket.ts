import { browser, dev } from '$app/env';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const endpoint = dev ? 'http://localhost:3004' : 'https://api.languagegam.es';

function initializeSocket() {
	socket = io(endpoint, {
		transports: ['websocket'] // HTTP long-polling is disabled
	});
	socket.on('connect', () => {
		console.log('connected', socket.id);
	});
}

export function getSocket(fn: (socket: Socket) => void): void {
	if (browser) {
		if (!socket) {
			initializeSocket();
		}
		fn(socket);
	}
}
