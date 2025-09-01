import { env } from '$env/dynamic/private';
import type { IKeyValueStore } from './interface';
import { initKeyValueStore } from './init';
import type { Token, TokenData } from '$lib/types/token';
import { z } from 'zod/v4';
import { timeCompare, timeDelta, timeNow, timeToSeconds } from '../time/utils';

const storageKeyTokenPrefix = 'MR_TOKEN_';

function storageKeyToken(token: string): string {
	if (!z.uuidv4().safeParse(token).success) {
		throw new Error(`Token passed isn't a valid UUIDv4: ${token}`);
	}

	return `${storageKeyTokenPrefix}${token}`;
}

function storageKeyTokenWithoutPrefix(key: string): string {
	if (!key.startsWith(storageKeyTokenPrefix)) {
		throw new Error(`Key (${key}) doesn't start with prefix: ${storageKeyTokenPrefix}`);
	}

	const token = key.substring(storageKeyTokenPrefix.length);
	if (!z.uuidv4().safeParse(token).success) {
		throw new Error(`Token extracted from the key isn't a valid UUIDv4: ${token}`);
	}

	return token;
}

export function initDatabase(): IKeyValueStore<TokenData> {
	return initKeyValueStore<TokenData>('TOKEN');
}

export async function validToken(db: IKeyValueStore<TokenData>, token: string): Promise<boolean> {
	try {
		const tokenData = await db.get(storageKeyToken(token));
		return tokenData ? true : false;
	} catch (error) {
		throw new Error(`Failed to check if the item is in the DB: ${error}`);
	}
}

export async function createToken(
	db: IKeyValueStore<TokenData>,
	token: string,
	description: string,
	expiresAt: Date
): Promise<Token> {
	if (token === '') {
		throw new Error('Token must not be empty string');
	}

	const timestamp = timeNow();
	if (!timeCompare(expiresAt, timestamp)) {
		throw new Error('Expiry must be future');
	}

	const ttl = timeToSeconds(timeDelta(timestamp, expiresAt));
	if (ttl < 60) {
		throw new Error('TTL cannot be less than 60 seconds');
	}

	let maxTokensReached: boolean;
	try {
		const keys = await db.keys(storageKeyTokenPrefix);
		if (keys.length >= Number.parseInt(env.MR_TOKEN_MAXIMUM_ACTIVE ?? '1000')) {
			maxTokensReached = true;
		} else {
			maxTokensReached = false;
		}
	} catch (error) {
		throw new Error(`Failed to get keys from the DB: ${error}`);
	}
	if (maxTokensReached) {
		throw new Error('Maximum amount of active tokens has been reached');
	}

	try {
		const key = storageKeyToken(token);
		const value: TokenData = {
			description,
			createdAt: timestamp,
			expiresAt
		};
		await db.set(key, value, ttl);

		return {
			token,
			description,
			createdAt: timestamp,
			expiresAt
		};
	} catch (error) {
		throw new Error(`Failed to set the new item in the DB: ${error}`);
	}
}

export async function removeToken(db: IKeyValueStore<TokenData>, token: string): Promise<boolean> {
	try {
		return await db.del(storageKeyToken(token));
	} catch (error) {
		throw new Error(`Failed to delete the item from the DB: ${error}`);
	}
}

export async function getAllTokens(db: IKeyValueStore<TokenData>): Promise<Token[]> {
	try {
		const entries = await db.entries(storageKeyTokenPrefix);
		return entries.map(({ key, value }) => ({
			token: storageKeyTokenWithoutPrefix(key),
			description: value.description,
			createdAt: value.createdAt,
			expiresAt: value.expiresAt
		}));
	} catch (error) {
		throw new Error(`Failed to get all entries from the DB: ${error}`);
	}
}

export async function removeAllTokens(db: IKeyValueStore<TokenData>): Promise<boolean> {
	try {
		return await db.clear(storageKeyTokenPrefix);
	} catch (error) {
		throw new Error(`Failed to clear items from the DB: ${error}`);
	}
}
