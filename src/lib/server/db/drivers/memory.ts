import type { IKeyValueStore } from '../interface';
import { timeCompare, timeFromSecondsN, timeNow, timeOffset } from '$lib/time/utils';

export class MemoryKVStore<V> implements IKeyValueStore<V> {
	private store: Map<string, { value: V; createdAt: Date; expiresAt?: Date }> = new Map();

	// Check if a key exists in the store
	async has(key: string): Promise<boolean> {
		const entry = this.store.get(key);
		if (!entry) return false;

		if (entry.expiresAt && timeCompare(timeNow(), entry.expiresAt)) {
			// TTL expired, delete the entry
			this.store.delete(key);
			return false;
		}

		return true;
	}

	// Get the value associated with a key
	async get(key: string): Promise<V | undefined> {
		const entry = this.store.get(key);
		if (!entry) return undefined;

		if (entry.expiresAt && timeCompare(timeNow(), entry.expiresAt)) {
			// TTL expired, delete the entry
			this.store.delete(key);
			return undefined;
		}

		return entry.value;
	}

	// Set a value for a key with optional TTL in seconds
	async set(key: string, value: V, ttl?: number): Promise<void> {
		const createdAt = timeNow();

		if (ttl) {
			const expiresAt = timeOffset(createdAt, timeFromSecondsN(ttl));
			this.store.set(key, { value, createdAt, expiresAt });
		} else {
			this.store.set(key, { value, createdAt });
		}
	}

	// Delete a key from the store
	async del(key: string): Promise<boolean> {
		return this.store.delete(key);
	}

	// Get all keys, with an optional prefix for filtering keys
	async keys(prefix?: string): Promise<Array<string>> {
		const keys: Array<string> = [];

		for (const [key, { expiresAt }] of this.store.entries()) {
			if (prefix && !key.startsWith(prefix)) continue;

			if (expiresAt && timeCompare(timeNow(), expiresAt)) {
				// TTL expired, delete the entry
				this.store.delete(key);
				continue;
			}

			keys.push(key);
		}

		return keys;
	}

	// Get all keys/values, with an optional prefix for filtering keys
	async entries(prefix?: string): Promise<Array<{ key: string; value: V }>> {
		const entries: Array<{ key: string; value: V }> = [];

		for (const [key, { value, expiresAt }] of this.store.entries()) {
			if (prefix && !key.startsWith(prefix)) continue;

			if (expiresAt && timeCompare(timeNow(), expiresAt)) {
				// TTL expired, delete the entry
				this.store.delete(key);
				continue;
			}

			entries.push({ key, value });
		}

		return entries;
	}

	// Delete all keys, with an optional prefix for filtering keys
	async clear(prefix?: string): Promise<boolean> {
		let result = false;

		for (const key of this.store.keys()) {
			if (prefix && !key.startsWith(prefix)) continue;

			this.store.delete(key);
			if (!result) result = true;
		}

		return result;
	}
}
