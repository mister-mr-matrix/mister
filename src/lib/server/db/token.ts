import { env } from '$env/dynamic/private';
import { z } from 'zod/v4';
import type { IKeyValueStore } from './interface';
import { initKeyValueStore } from './init';
import type { Token, TokenData } from '$lib/types/token';
import { timeFromSecondsN, timeNow, timeOffset } from '$lib/time/utils';

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
		return await db.has(storageKeyToken(token));
	} catch (error) {
		throw new Error(`Failed to check if the token is in the DB: ${error}`);
	}
}

export async function createToken(
	db: IKeyValueStore<TokenData>,
	token: string,
	description: string,
	ttl: number
): Promise<Token> {
	if (token === '') {
		throw new Error('Token must not be empty string');
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
		throw new Error(`Failed to get tokens from the DB: ${error}`);
	}
	if (maxTokensReached) {
		throw new Error('Maximum amount of active tokens has been reached');
	}

	try {
		const createdAt = timeNow();
		const expiresAt = timeOffset(createdAt, timeFromSecondsN(ttl));

		const key = storageKeyToken(token);
		const value: TokenData = {
			description,
			createdAt,
			expiresAt
		};
		await db.set(key, value, ttl);

		return {
			token,
			description,
			createdAt,
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
