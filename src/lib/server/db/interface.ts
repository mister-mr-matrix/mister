// Define a generic interface for a KV store
export interface IKeyValueStore<V> {
	// Check if a key exists in the store
	has(key: string): Promise<boolean>;

	// Get the value associated with a key
	get(key: string): Promise<V | undefined>;

	// Set a value for a key with optional TTL in seconds
	set(key: string, value: V, ttl?: number): Promise<void>;

	// Delete a key from the store
	del(key: string): Promise<boolean>;

	// Get all keys, with an optional prefix for filtering keys
	keys(prefix?: string): Promise<Array<string>>;

	// Get all keys/values, with an optional prefix for filtering keys
	entries(prefix?: string): Promise<Array<{ key: string; value: V }>>;
}
