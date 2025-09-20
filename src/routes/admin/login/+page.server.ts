import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { createSession } from '$lib/server/db/session.js';
import { setSessionTokenCookie } from '$lib/server/auth/session.js';
import { hashPassword, verifyPasswordHash } from '$lib/server/auth/password.js';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const {
			request,
			locals: {
				config: { adminToken, sessionTTL },
				sessionDB
			}
		} = event;

		const form = await superValidate(request, zod4(formSchema));
		if (!form.valid) {
			const msg = 'Invalid form';
			console.debug(msg);
			return fail(400, {
				form,
				msg
			});
		}

		const { token } = form.data;
		const hashedAdminToken = await hashPassword(adminToken);
		const validToken = await verifyPasswordHash(hashedAdminToken, token);
		if (!validToken) {
			const msg = 'Invalid token';
			console.error(msg);
			return fail(500, {
				form,
				msg
			});
		}

		try {
			const { timestamp } = await createSession(sessionDB, token, sessionTTL);
			setSessionTokenCookie(event, token, new Date(timestamp), sessionTTL);
		} catch (error) {
			const msg = 'Failed to login';
			console.error(`${msg}: ${error}`);
			return fail(500, {
				form,
				msg
			});
		}

		return redirect(302, '/admin');
	}
};
