import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Config } from '$lib/types/config';
import { hashPassword } from '$lib/server/auth/password';

export async function initConfig(): Promise<Config> {
	if (building) {
		return null!;
	}

	if (env.MR_ADMIN_TOKEN === undefined) {
		throw new Error('MR_ADMIN_TOKEN env var not set');
	}

	return {
		hashedAdminToken: await hashPassword(env.MR_ADMIN_TOKEN),
		inactivityTimeout: Number.parseInt(env.MR_SESSION_INACTIVITY_TIMEOUT ?? '5', 10) * 60 * 1000
	};
}
