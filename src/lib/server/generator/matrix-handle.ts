import { env } from '$env/dynamic/private';

export function matrixHandle(username: string): string {
	if (env.MR_MATRIX_HOMESERVER === undefined) {
		throw new Error('MR_MATRIX_HOMESERVER env var not set');
	}

	return `@${username}:${env.MR_MATRIX_HOMESERVER}`;
}
