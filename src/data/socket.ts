import { browser } from '$app/env';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

function initializeSocket() {
	socket = io('http://localhost:3004', {
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
