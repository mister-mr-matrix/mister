import { env } from '$env/dynamic/private';
import type { Credentials } from '$lib/types/credentials';
import { availableUsername } from './available';

type MatrixRegisterResponse = {
	access_token: string;
	user_id: string;
	device_id: string;
};

export async function registerUser(credentials: Credentials): Promise<boolean> {
	if (env.MR_MATRIX_HOMESERVER_URL === undefined) {
		throw new Error('MR_MATRIX_HOMESERVER_URL env var not set');
	}
	if (env.MR_MATRIX_REGISTRATION_TOKEN === undefined) {
		throw new Error('MR_MATRIX_REGISTRATION_TOKEN env var not set');
	}

	const ok = await availableUsername(credentials.username);
	if (!ok) {
		throw new Error(`Username already taken`);
	}

	const url = `${env.MR_MATRIX_HOMESERVER_URL}/_matrix/client/v3/register`;
	const body = {
		auth: {
			type: 'm.login.registration_token',
			token: env.MR_MATRIX_REGISTRATION_TOKEN
		},
		username: credentials.username,
		password: credentials.passphrase
	};

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
		const result: MatrixRegisterResponse = await response.json();

		if (response.ok) {
			console.debug('User registered successfully:', JSON.stringify(result));
		} else {
			throw new Error(`Registration failed: ${JSON.stringify(result)}`);
		}
	} catch (error) {
		console.error('Error registering user:', error);
		return false;
	}

	return true;
}
