import type { Socket } from 'socket.io-client';

const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

let checkIfAllConnected: () => void;

export async function connectToPeers(
	socket: Socket,
	stream: MediaStream,
	selfId: string,
	peerIds: string[],
	playerNames: Record<string, string>,
	room: string,
	onAllConnected: () => void
): Promise<{
	peers: Record<string, RTCPeerConnection>;
	remoteStreams: Record<string, MediaStream>;
	cleanup: () => void;
}> {
	const peers: Record<string, RTCPeerConnection> = {};
	const remoteStreams: Record<string, MediaStream> = {};
	remoteStreams[selfId] = stream;
	let allConnected = false;

	checkIfAllConnected = () => {
		if (allConnected) return;
		for (const id in playerNames) {
			if (!remoteStreams[id]) {
				return;
			}
			const stream = remoteStreams[id];
			if (stream.getTracks().length === 0) {
				return;
			}
			if (!stream.active) {
				return;
			}
		}
		allConnected = true;
		onAllConnected();
	};

	await Promise.all(
		peerIds.map((id) => initRTCPeerConnection(peers, remoteStreams, socket, stream)(selfId, id))
	);

	// when a user leaves
	socket.on('user:leave', removeRTCPeerConnection(peers));

	// when new user sent an answer
	socket.on('user:rtc:answer', onRTCAnswer(peers));

	// when a user gets an offer
	socket.on('user:rtc:offer', onRTCoffer(peers, remoteStreams, socket, stream));

	// when a candidate arrives
	socket.on('user:rtc:candidate', onRTCIceCandidate(peers));

	return {
		peers,
		remoteStreams,
		cleanup: () => {
			socket.emit('user:leave', room);
			socket.removeAllListeners('user:leave');
			socket.removeAllListeners('user:rtc:answer');
			socket.removeAllListeners('user:rtc:offer');
			socket.removeAllListeners('user:rtc:candidate');
			for (const id in peers) {
				peers[id].close();
				delete peers[id];
			}
			for (const id in remoteStreams) {
				if (id === selfId) {
					continue;
				}
				remoteStreams[id].getTracks().forEach((track) => track.stop());
				delete remoteStreams[id];
			}
		}
	};
}

const initRTCPeerConnection =
	(
		peers: Record<string, RTCPeerConnection>,
		remoteStreams: Record<string, MediaStream>,
		socket: Socket,
		stream: MediaStream
	) =>
	async (selfId: string, id: string) => {
		const pc = new RTCPeerConnection(RTC_CONFIG);

		remoteStreams[id] = remoteStreams[id] || new MediaStream();

		addLocalStream(stream, pc);
		addRemoteStream(remoteStreams[id], pc);

		pc.onicecandidate = sendIceCandidate(socket, id);

		// add peerconnection to peerlist
		peers[id] = pc;

		// only send offer if we are initiator
		if (id < selfId) {
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			socket.emit('user:rtc:offer', { id, offer });
		}
	};

const sendIceCandidate =
	(socket: Socket, id: string) =>
	({ candidate }) => {
		if (candidate) {
			socket.emit('user:rtc:candidate', { id, candidate });
		}
	};

const onRTCIceCandidate =
	(peers: Record<string, RTCPeerConnection>) =>
	async ({ id, candidate }) => {
		if (!candidate) return;
		const pc = peers[id];
		if (!pc) return;
		await pc.addIceCandidate(candidate);
	};

const removeRTCPeerConnection = (peers: Record<string, RTCPeerConnection>) => (id) => {
	const pc = peers[id];
	if (!pc) return;
	pc.close();
	delete peers[id];
};

const onRTCAnswer =
	(peers: Record<string, RTCPeerConnection>) =>
	async ({ id, answer }) => {
		const pc = peers[id];

		if (!pc) return;

		if (!answer) return;

		const desc = new RTCSessionDescription(answer);

		await pc.setRemoteDescription(desc);
	};

const onRTCoffer =
	(
		peers: Record<string, RTCPeerConnection>,
		remoteStreams: Record<string, MediaStream>,
		socket: Socket,
		stream: MediaStream
	) =>
	async ({ id, offer }) => {
		if (!offer) return;
		const pc = new RTCPeerConnection(RTC_CONFIG);

		remoteStreams[id] = remoteStreams[id] || new MediaStream();
		addLocalStream(stream, pc);
		addRemoteStream(remoteStreams[id], pc);

		pc.onicecandidate = sendIceCandidate(socket, id);
		peers[id] = pc;
		const desc = new RTCSessionDescription(offer);
		pc.setRemoteDescription(desc);
		const answer = await pc.createAnswer();
		await pc.setLocalDescription(answer);
		socket.emit('user:rtc:answer', { id, answer });
	};

const addLocalStream = (stream: MediaStream, pc: RTCPeerConnection) => {
	stream.getTracks().forEach((track) => pc.addTrack(track, stream));
};

const addRemoteStream = (stream: MediaStream, pc: RTCPeerConnection) => {
	pc.ontrack = async (evt) => {
		stream.addTrack(evt.track);
		if (checkIfAllConnected) {
			checkIfAllConnected();
		}
	};
};
