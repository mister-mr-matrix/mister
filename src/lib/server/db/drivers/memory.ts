import type { IKeyValueStore } from '../interface';

export class MemoryKVStore<V> implements IKeyValueStore<V> {
	private store: Map<string, { value: V; ttl?: number; timestamp: number }> = new Map();

	// Check if a key exists in the store
	async has(key: string): Promise<boolean> {
		const entry = this.store.get(key);
		if (!entry) return false;

		if (entry.ttl && Date.now() - entry.timestamp > entry.ttl * 1000) {
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

		if (entry.ttl && Date.now() - entry.timestamp > entry.ttl * 1000) {
			// TTL expired, delete the entry
			this.store.delete(key);
			return undefined;
		}

		return entry.value;
	}

	// Set a value for a key with optional TTL in seconds
	async set(key: string, value: V, ttl?: number): Promise<void> {
		const timestamp = Date.now();
		this.store.set(key, { value, ttl, timestamp });
	}

	// Delete a key from the store
	async del(key: string): Promise<boolean> {
		return this.store.delete(key);
	}

	// Get all keys, with an optional prefix for filtering keys
	async keys(prefix?: string): Promise<Array<string>> {
		const keys: Array<string> = [];

		for (let [key, { ttl, timestamp }] of this.store.entries()) {
			if (prefix && !key.startsWith(prefix)) continue;

			if (ttl && Date.now() - timestamp > ttl * 1000) {
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

		for (let [key, { value, ttl, timestamp }] of this.store.entries()) {
			if (prefix && !key.startsWith(prefix)) continue;

			if (ttl && Date.now() - timestamp > ttl * 1000) {
				// TTL expired, delete the entry
				this.store.delete(key);
				continue;
			}

			entries.push({ key, value });
		}

		return entries;
	}
}
