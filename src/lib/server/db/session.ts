import type { IKeyValueStore } from './interface';
import { initKeyValueStore } from './init';
import type { Session, SessionData } from '$lib/types/session';
import { hashSessionToken } from '$lib/server/auth/session';

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
	const timestamp = new Date(Date.now());

	try {
		const key = storageKeySessionId(sessionId);
		const value: SessionData = {
			timestamp
		};
		await db.set(
			key,
			value,
			(timestamp.getTime() + inactivityTimeout) / 1000 // TTL is in seconds
		);

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
	inactivityTimeout: number
): Promise<Session | null> {
	const sessionId = hashSessionToken(token);
	const timestamp = new Date(Date.now());

	const key = storageKeySessionId(sessionId);
	const value: SessionData = {
		timestamp
	};

	try {
		const session = await db.get(key);
		if (session === undefined) {
			return null;
		}

		const ts = new Date(session.timestamp);
		if (timestamp.getTime() > ts.getTime() + inactivityTimeout) {
			await invalidateSession(db, sessionId);
			return null;
		}
	} catch (error) {
		throw new Error(`Failed to check if the item is in the DB: ${error}`);
	}

	try {
		await db.set(
			key,
			value,
			(timestamp.getTime() + inactivityTimeout) / 1000 // TTL is in seconds
		);
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
