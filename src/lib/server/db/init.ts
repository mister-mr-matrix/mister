import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { IKeyValueStore } from './interface';
import { MemoryKVStore } from './drivers/memory';
import { RedisKVStore } from './drivers/redis';

export function initKeyValueStore<V>(usecase: string): IKeyValueStore<V> {
	if (building) {
		return null!;
	}

	switch (env.MR_DATABASE_DRIVER ?? 'memory') {
		case 'memory': {
			console.warn(
				`(${usecase}) Running with in-memory database, all state will be lost on restart!`
			);
			return new MemoryKVStore<V>();
		}
		case 'redis': {
			console.info(`(${usecase}) Using redis database driver`);
			return new RedisKVStore<V>({
				host: env.MR_DATABASE_REDIS_HOST ?? 'localhost',
				port: Number.parseInt(env.MR_DATABASE_REDIS_PORT ?? '6379'),
				username: env.MR_DATABASE_REDIS_USERNAME ?? 'default',
				password: env.MR_DATABASE_REDIS_PASSWORD ?? '',
				db: Number.parseInt(env.MR_DATABASE_REDIS_DB ?? '0')
			});
		}
		default: {
			console.error(`(${usecase}) Database driver must be set`);
			throw new Error(`(${usecase}) Database driver must be set`);
		}
	}
}
