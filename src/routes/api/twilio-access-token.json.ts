import type { RequestHandler } from '@sveltejs/kit';
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_KEY_SID;
const twilioApiSecret = process.env.TWILIO_API_KEY_SECRET;

export const get: RequestHandler = async (req) => {
	const identity = req.query.get('identity');
	const room = req.query.get('room');
	const videoGrant = new VideoGrant({
		room
	});
	const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, { identity });
	token.addGrant(videoGrant);
	return {
		status: 200,
		body: { token: token.toJwt() }
	};
};
