import type { RequestHandler } from '@sveltejs/kit';
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

let token;

export const get: RequestHandler = async () => {
	if (token) {
		const { dateCreated, ttl, iceServers } = token;
		// reuse token if has at least 4 hours valid time left
		if (+new Date() + 4 * 60 * 60 * 1000 < +dateCreated + +ttl * 1000) {
			console.log('Reusing twilio token...');
			return { status: 200, body: iceServers };
		}
	}
	console.log('Requesting new twilio token...');
	token = await client.tokens.create();
	return { status: 200, body: token.iceServers };
};
