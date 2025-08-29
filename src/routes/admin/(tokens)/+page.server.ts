import type { PageServerLoad, Actions } from '../$types.js';
import { getAllTokens } from '$lib/server/db/token';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchemaRemoveToken } from './schema.js';
import { fail } from '@sveltejs/kit';
import { removeToken } from '$lib/server/db/token';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals: { tokenDB } }) => {
	if (env.MR_FRONTEND_URL === undefined) {
		throw new Error('MR_FRONTEND_URL env var not set');
	}

	return {
		formRemoveToken: await superValidate(zod4(formSchemaRemoveToken)),
		tokens: await getAllTokens(tokenDB),
		frontendUrl: new URL(env.MR_FRONTEND_URL).href
	};
};

export const actions: Actions = {
	removeToken: async ({ request, locals: { tokenDB } }) => {
		const form = await superValidate(request, zod4(formSchemaRemoveToken));
		if (!form.valid) {
			const msg = 'Invalid form';
			console.debug(msg);
			return fail(400, {
				form,
				msg
			});
		}

		const { token } = form.data;

		try {
			await removeToken(tokenDB, token);
		} catch (error) {
			const msg = 'Failed to remove registration token';
			console.error(`${msg}: ${error}`);
			return fail(500, {
				form,
				msg
			});
		}

		const msg = 'Successfully removed token';
		return {
			form,
			msg
		};
	}
};
