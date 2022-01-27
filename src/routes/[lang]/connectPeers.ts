import type { Socket } from 'socket.io-client';
import type {
	LocalParticipant,
	RemoteAudioTrack,
	RemoteParticipant,
	RemoteTrack,
	RemoteVideoTrack
} from 'twilio-video';
import { getAccesToken, getTwilioVideo } from '../twilio';

export type Listener = (id: string, message: unknown, timestamp: number) => void;

export async function connectToPeers(
	socket: Socket,
	tracks: MediaStreamTrack[],
	selfId: string,
	peerIds: string[],
	useVideo: boolean,
	room: string,
	onAllConnected: () => void,
	onDisconnected: (arg: { id: string; playerIds: string[] }) => void,
	onTrackSubscribed: (remoteTracks: Record<string, MediaStreamTrack[]>) => void
): Promise<{
	remoteTracks: Record<string, MediaStreamTrack[]>;
	cleanup: () => void;
	addMessageListener: (listener: Listener) => void;
	removeMessageListener: (listener: Listener) => void;
	sendMessage: (message: unknown) => void;
	localParticipant: LocalParticipant;
}> {
	const remoteTracks: Record<string, MediaStreamTrack[]> = {};
	let localParticipant = null;
	let twilioRoom = null;
	if (useVideo) {
		const token = await getAccesToken(selfId, room);
		const Video = await getTwilioVideo();
		twilioRoom = await Video.connect(token, { name: room, tracks });
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
		localParticipant = twilioRoom.localParticipant;
	}

	const messageListeners: Listener[] = [];
	socket.on('user:message:send', ({ id, message, timestamp }) => {
		for (const listener of messageListeners) {
			listener(id, message, timestamp);
		}
	});

	socket.on('user:leave', (id) => {
		console.log('User left:', id);
		onDisconnected(id);
	});

	return {
		localParticipant,
		remoteTracks,
		cleanup: () => {
			messageListeners.length = 0;
			twilioRoom?.disconnect();
			socket.emit('user:leave', room);
			socket.removeAllListeners('user:leave');
		},
		addMessageListener: (listener) => {
			messageListeners.push(listener);
		},
		removeMessageListener: (listener) => {
			messageListeners.splice(messageListeners.indexOf(listener), 1);
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
		console.log(
			'Publication:',
			publication,
			publication.isSubscribed,
			publication.isEnabled,
			publication.track
		);
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
