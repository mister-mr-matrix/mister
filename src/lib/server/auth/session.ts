import type { RequestEvent } from '@sveltejs/kit';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { timeFromSecondsN, timeOffset } from '$lib/time/utils';

export const sessionCookieName = 'session';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	const randomBytes = crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(randomBytes);
	return token;
}

export function hashSessionToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export function setSessionTokenCookie(
	event: RequestEvent,
	token: string,
	timestamp: Date,
	sessionTTL: number
): void {
	event.cookies.set(sessionCookieName, token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		expires: timeOffset(timestamp, timeFromSecondsN(sessionTTL))
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.delete(sessionCookieName, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/'
	});
}
