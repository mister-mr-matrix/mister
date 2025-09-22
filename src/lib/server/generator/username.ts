import { env } from '$env/dynamic/private';
import generator from 'eff-diceware-passphrase';
import { availableUsername } from '$lib/server/matrix/available';

type UsernameAPIResponse = {
	username: string;
};

export async function generateUsername(skip?: boolean): Promise<string> {
	const tries = 5;

	for (let i = 0; i < tries; i++) {
		const username =
			env.MR_USERNAME_API_URL === undefined ? generator(2).join('') : await getUsernameFromAPI();
		if (skip) {
			return username;
		}

		const ok = await availableUsername(username);
		if (ok) {
			return username;
		}
	}

	throw new Error(`Failed to generate an available username ${tries} times in a row`);
}

async function getUsernameFromAPI(): Promise<string> {
	if (env.MR_USERNAME_API_URL === undefined) {
		throw new Error('MR_USERNAME_API_URL env var not set');
	}

	const url = new URL(env.MR_USERNAME_API_URL);

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const result: UsernameAPIResponse = await response.json();

		if (!response.ok) {
			throw new Error(`Username availability check failed: ${JSON.stringify(result)}`);
		}

		if (result.username) {
			console.debug('Username found in the API response:', JSON.stringify(result));
			return result.username;
		} else {
			throw new Error(`No username found in the API response: ${JSON.stringify(result)}`);
		}
	} catch (error) {
		throw new Error(`Error getting the username from the API: ${error}`);
	}
}
