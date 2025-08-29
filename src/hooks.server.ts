import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { initConfig } from '$lib/server/config/init';
import { initDatabase as initSessionDB, validateSessionToken } from '$lib/server/db/session';
import { initDatabase as initTokenDB } from '$lib/server/db/token';
import {
	setSessionTokenCookie,
	deleteSessionTokenCookie,
	sessionCookieName
} from '$lib/server/auth/session';

const cfg = await initConfig();
const sessionDB = initSessionDB();
const tokenDB = initTokenDB();

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.config = cfg;
	event.locals.sessionDB = sessionDB;
	event.locals.tokenDB = tokenDB;

	// Require session for admin routes
	if (event.url.pathname.startsWith('/admin')) {
		const token = event.cookies.get(sessionCookieName);

		// If no token exists, set the session to null and redirect to login page
		if (token === undefined) {
			event.locals.session = null;

			if (event.url.pathname !== '/admin/login') {
				return redirect(302, '/admin/login');
			}

			return resolve(event);
		}

		// Validate session token
		const session = await validateSessionToken(sessionDB, token, cfg.inactivityTimeout);
		if (session !== null) {
			// If session is valid, ensure the token is up-to-date
			setSessionTokenCookie(event, token, new Date(session.timestamp), cfg.inactivityTimeout);

			// Redirect to the admin home page after login
			if (event.url.pathname === '/admin/login') {
				return redirect(302, '/admin');
			}
		} else {
			// If the session is invalid, delete the session cookie
			deleteSessionTokenCookie(event);

			// Redirect to the admin login page after the session expiry
			if (event.url.pathname !== '/admin/login') {
				return redirect(302, '/admin/login');
			}
		}

		// Set the session in locals for the rest of the request
		event.locals.session = session;
	}

	return resolve(event);
};
