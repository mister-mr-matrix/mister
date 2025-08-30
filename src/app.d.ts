import type { Config } from '$lib/types/config';
import type { IKeyValueStore } from '$lib/server/db/interface';
import type { Session, SessionData } from '$lib/types/session';
import type { TokenData } from '$lib/types/token';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			config: Config;
			sessionDB: IKeyValueStore<SessionData>;
			tokenDB: IKeyValueStore<TokenData>;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
