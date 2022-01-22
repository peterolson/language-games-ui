declare type TwilioVideo = typeof import('twilio-video');

// https://sdk.twilio.com/js/video/releases/2.15.2/twilio-video.min.js

let isTwilioImported = false;
async function importTwilioScript(): Promise<void> {
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

export async function getAccesToken(identity: string, room: string): Promise<string> {
	const { token } = await fetch(
		`/api/twilio-access-token.json?identity=${identity}&room=${room}`
	).then((res) => res.json());
	return token;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Twilio: any;

export async function getTwilioVideo(): Promise<TwilioVideo> {
	await importTwilioScript();
	return Twilio.Video as TwilioVideo;
}
