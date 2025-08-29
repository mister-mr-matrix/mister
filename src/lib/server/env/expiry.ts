import { env } from '$env/dynamic/private';

export function expiryOptions(): string[] {
	return (env.MR_TOKEN_EXPIRY_OPTIONS ?? '1h,6h,12h,1d,3d,1w').split(',');
}
