import generator from 'eff-diceware-passphrase';
import { availableUsername } from '$lib/server/matrix/available';

export async function generateUsername(skip?: boolean): Promise<string> {
	const tries = 5;

	for (let i = 0; i < tries; i++) {
		const username = generator(2).join('');
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
