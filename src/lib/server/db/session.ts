import type { IKeyValueStore } from './interface';
import { initKeyValueStore } from './init';
import type { Session, SessionData } from '$lib/types/session';
import { hashSessionToken } from '$lib/server/auth/session';
import { timeNow, timeToSeconds } from '$lib/time/utils';

const storageKeySessionIdPrefix = 'MR_SESSION_';

function storageKeySessionId(sessionId: string): string {
	return `${storageKeySessionIdPrefix}${sessionId}`;
}

export function initDatabase(): IKeyValueStore<SessionData> {
	return initKeyValueStore<SessionData>('SESSION');
}

export async function createSession(
	db: IKeyValueStore<SessionData>,
	token: string,
	inactivityTimeout: number
): Promise<Session> {
	if (token === '') {
		throw new Error('Invalid token passed (empty)');
	}

	const sessionId = hashSessionToken(token);
	const timestamp = timeNow();

	try {
		const key = storageKeySessionId(sessionId);
		const value: SessionData = {
			timestamp
		};
		await db.set(key, value, timeToSeconds(inactivityTimeout));

		return {
			sessionId,
			timestamp
		};
	} catch (error) {
		throw new Error(`Failed to set the new item in the DB: ${error}`);
	}
}

export async function validateSessionToken(
	db: IKeyValueStore<SessionData>,
	token: string,
	sessionTTL: number
): Promise<Session | null> {
	const sessionId = hashSessionToken(token);
	const timestamp = timeNow();

	const key = storageKeySessionId(sessionId);
	const value: SessionData = {
		timestamp
	};

	try {
		const session = await db.get(key);
		if (session === undefined) {
			return null;
		}
	} catch (error) {
		throw new Error(`Failed to check if the item is in the DB: ${error}`);
	}

	try {
		await db.set(key, value, sessionTTL);
	} catch (error) {
		throw new Error(`Failed to set the new timestamp for the item in the DB: ${error}`);
	}

	return {
		sessionId,
		timestamp
	};
}

export async function invalidateSession(
	db: IKeyValueStore<SessionData>,
	sessionId: string
): Promise<boolean> {
	try {
		return await db.del(storageKeySessionId(sessionId));
	} catch (error) {
		throw new Error(`Failed to delete the item from the DB: ${error}`);
	}
}
