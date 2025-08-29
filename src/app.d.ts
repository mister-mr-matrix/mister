import type { Config } from '$lib/types/config';
import type { Session, SessionData } from '$lib/types/session';
import type { TokenData } from '$lib/types/token';
import { type Storage } from 'unstorage';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			config: Config;
			sessionDB: Storage<SessionData>;
			tokenDB: Storage<TokenData>;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
