import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Config } from '$lib/types/config';

export function initConfig(): Config {
	if (building) {
		return null!;
	}

	if (env.MR_ADMIN_TOKENS === undefined && env.MR_ADMIN_TOKEN === undefined) {
		throw new Error('MR_ADMIN_TOKENS env var not set');
	}

	return {
		adminTokens: env.MR_ADMIN_TOKENS ? env.MR_ADMIN_TOKENS.split(',') : [env.MR_ADMIN_TOKEN],
		sessionTTL: Number.parseInt(env.MR_SESSION_INACTIVITY_TIMEOUT ?? '5', 10) * 60,
		expiryOpts: (env.MR_TOKEN_EXPIRY_OPTIONS ?? '1h,6h,12h,1d,3d,1w').split(',')
	};
}
