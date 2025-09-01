import type { IKeyValueStore } from '../interface';
import { Redis, type RedisOptions } from 'iovalkey';

export class RedisKVStore<V> implements IKeyValueStore<V> {
	private redis: Redis;

	constructor(redisConfig: RedisOptions = {}) {
		this.redis = new Redis(redisConfig);
	}

	// Check if a key exists in the store
	async has(key: string): Promise<boolean> {
		const result = await this.redis.exists(key);
		if (result !== 1) {
			return false;
		}

		const ttl = await this.redis.ttl(key);
		if (ttl === -2) {
			return false;
		}

		return true;
	}

	// Get the value associated with a key
	async get(key: string): Promise<V | undefined> {
		const value = await this.redis.get(key);
		if (value === null) {
			return undefined;
		}

		const ttl = await this.redis.ttl(key);
		if (ttl === -2) {
			return undefined;
		}

		return JSON.parse(value);
	}

	// Set a value for a key with optional TTL in seconds
	async set(key: string, value: V, ttl?: number): Promise<void> {
		if (ttl) {
			await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
		} else {
			await this.redis.set(key, JSON.stringify(value));
		}
	}

	// Delete a key from the store
	async del(key: string): Promise<boolean> {
		const result = await this.redis.del(key);
		return result > 0;
	}

	// Get all keys, with an optional prefix for filtering keys
	async keys(prefix?: string): Promise<Array<string>> {
		const keys = await this.redis.keys(`${prefix ?? ''}*`);
		const activeKeys: Array<string> = [];

		for (const key of keys) {
			const ttl = await this.redis.ttl(key);
			if (ttl === -2) {
				continue;
			}

			activeKeys.push(key);
		}

		return activeKeys;
	}

	// Get all keys/values, with an optional prefix for filtering keys
	async entries(prefix?: string): Promise<Array<{ key: string; value: V }>> {
		const keys = await this.redis.keys(`${prefix ?? ''}*`);
		const entries: Array<{ key: string; value: V }> = [];

		for (const key of keys) {
			const ttl = await this.redis.ttl(key);
			if (ttl === -2) {
				continue;
			}

			const value = await this.redis.get(key);
			if (value) {
				entries.push({ key: key, value: JSON.parse(value) });
			}
		}

		return entries;
	}

	// Delete all keys, with an optional prefix for filtering keys
	async clear(prefix?: string): Promise<boolean> {
		const keys = await this.redis.keys(`${prefix ?? ''}*`);
		const result = await this.redis.del(keys);
		return result > 0;
	}

	// Close the Redis connection (optional)
	async close(): Promise<void> {
		await this.redis.quit();
	}
}
