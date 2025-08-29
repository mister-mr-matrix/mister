import { env } from '$env/dynamic/private';

type MatrixUsernameAvailableResponse = {
	available: boolean;
};

export async function availableUsername(username: string): Promise<boolean> {
	if (env.MR_MATRIX_HOMESERVER_URL === undefined) {
		throw new Error('MR_MATRIX_HOMESERVER_URL env var not set');
	}

	const url = `${env.MR_MATRIX_HOMESERVER_URL}/_matrix/client/v3/register/available?username=${encodeURIComponent(username)}`;

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const result: MatrixUsernameAvailableResponse = await response.json();

		if (response.ok) {
			if (result.available) {
				console.debug('Username is available:', JSON.stringify(result));
			} else {
				throw new Error(`Username is already taken: ${JSON.stringify(result)}`);
			}
		} else {
			throw new Error(`Username availability check failed: ${JSON.stringify(result)}`);
		}
	} catch (error) {
		console.error('Error checking availability of the username:', error);
		return false;
	}

	return true;
}
