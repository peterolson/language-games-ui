import type { Socket } from 'socket.io-client';
declare type TwilioVideo = typeof import('twilio-video');
import type {
	RemoteAudioTrack,
	RemoteParticipant,
	RemoteTrack,
	RemoteVideoTrack
} from 'twilio-video';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Twilio: any;

// https://sdk.twilio.com/js/video/releases/2.15.2/twilio-video.min.js

let isTwilioImported = false;
async function importTwilioScript() {
	return new Promise<void>((resolve, reject) => {
		if (isTwilioImported) {
			resolve();
			return;
		}
		const script = document.createElement('script');
		script.src = '//sdk.twilio.com/js/video/releases/2.18.2/twilio-video.min.js';
		script.onload = () => {
			isTwilioImported = true;
			resolve();
		};
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

export type Listener = (id: string, message: unknown, timestamp: number) => void;

export async function connectToPeers(
	socket: Socket,
	tracks: MediaStreamTrack[],
	selfId: string,
	peerIds: string[],
	playerNames: Record<string, string>,
	room: string,
	onAllConnected: () => void,
	onDisconnected: (id: string) => void,
	onTrackSubscribed: (remoteTracks: Record<string, MediaStreamTrack[]>) => void
): Promise<{
	remoteTracks: Record<string, MediaStreamTrack[]>;
	cleanup: () => void;
	addMessageListener: (listener: Listener) => void;
	sendMessage: (message: unknown) => void;
}> {
	const { token } = await fetch(
		`/api/twilio-access-token.json?identity=${selfId}&room=${room}`
	).then((res) => res.json());

	const remoteTracks: Record<string, MediaStreamTrack[]> = {};
	await importTwilioScript();
	const Video: TwilioVideo = Twilio.Video;
	const twilioRoom = await Video.connect(token, { name: room, tracks });
	twilioRoom.on('participantConnected', (participant) => {
		console.log('Participant connected:', participant.identity);
		console.log(participant);
	});
	twilioRoom.on('trackSubscribed', (track, _, participant) => {
		console.log('Track Subscribed:', track.kind, participant.identity);
		const id = participant.identity;
		remoteTracks[id] = remoteTracks[id] || [];
		attachAttachableTracksForRemoteParticipant(remoteTracks[id], participant);
		onTrackSubscribed(remoteTracks);
		if (Object.keys(remoteTracks).length === peerIds.length) {
			onAllConnected();
		}
	});
	twilioRoom.on('participantDisconnected', (participant) => {
		console.log('Participant disconnected:', participant.identity);
		onDisconnected(participant.identity);
	});
	twilioRoom.once('disconnected', function () {
		console.log('You left the Room:', twilioRoom.name);
	});

	const messageListeners: Listener[] = [];
	socket.on('user:message:send', ({ id, message, timestamp }) => {
		console.log('Received message from user:', id, message, timestamp);
		for (const listener of messageListeners) {
			listener(id, message, timestamp);
		}
	});

	socket.on('user:leave', (id) => {
		console.log('User left:', id);
		onDisconnected(id);
	});

	return {
		remoteTracks,
		cleanup: () => {
			messageListeners.length = 0;
			twilioRoom.disconnect();
			socket.emit('user:leave', room);
			socket.removeAllListeners('user:leave');
		},
		addMessageListener: (listener) => {
			messageListeners.push(listener);
		},
		sendMessage: (message) => {
			socket.emit('user:message:send', { room, message });
		}
	};
}

function attachAttachableTracksForRemoteParticipant(
	mediaTracks: MediaStreamTrack[],
	participant: RemoteParticipant
) {
	mediaTracks.length = 0;
	participant.tracks.forEach((publication) => {
		if (!publication.isSubscribed) return;

		if (!trackExistsAndIsAttachable(publication.track)) return;

		attachTrack(mediaTracks, publication.track);
	});
}

function attachTrack(mediaTracks: MediaStreamTrack[], track: RemoteAudioTrack | RemoteVideoTrack) {
	const mediaElement = track.attach();
	const mediaStream = mediaElement.srcObject as MediaStream;
	mediaStream.getTracks().forEach((track) => mediaTracks.push(track));
}

function trackExistsAndIsAttachable(
	track?: RemoteTrack
): track is RemoteAudioTrack | RemoteVideoTrack {
	return (
		!!track &&
		((track as RemoteAudioTrack).attach !== undefined ||
			(track as RemoteVideoTrack).attach !== undefined)
	);
}
