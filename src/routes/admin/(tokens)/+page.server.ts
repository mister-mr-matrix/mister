import type { PageServerLoad, Actions } from '../$types.js';
import { env } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { formSchemaRemoveAllTokens, formSchemaRemoveToken } from './schema.js';
import { getAllTokens } from '$lib/server/db/token';
import { removeToken, removeAllTokens } from '$lib/server/db/token';

export const load: PageServerLoad = async ({ locals: { tokenDB } }) => {
	if (env.MR_FRONTEND_URL === undefined) {
		throw new Error('MR_FRONTEND_URL env var not set');
	}

	return {
		formRemoveToken: await superValidate(zod4(formSchemaRemoveToken)),
		formRemoveAllTokens: await superValidate(zod4(formSchemaRemoveAllTokens)),
		tokens: await getAllTokens(tokenDB),
		frontendUrl: new URL(env.MR_FRONTEND_URL).href
	};
};

export const actions: Actions = {
	removeToken: async ({ request, locals: { tokenDB } }) => {
		const formRemoveToken = await superValidate(request, zod4(formSchemaRemoveToken));
		if (!formRemoveToken.valid) {
			const msg = 'Invalid form';
			console.debug(msg);
			return fail(400, {
				formRemoveToken,
				msg
			});
		}

		const { token } = formRemoveToken.data;

		try {
			await removeToken(tokenDB, token);
		} catch (error) {
			const msg = 'Failed to remove registration token';
			console.error(`${msg}: ${error}`);
			return fail(500, {
				formRemoveToken,
				msg
			});
		}

		const msg = 'Successfully removed token';
		return {
			formRemoveToken,
			msg
		};
	},
	removeAllTokens: async ({ request, locals: { tokenDB } }) => {
		const formRemoveAllTokens = await superValidate(request, zod4(formSchemaRemoveAllTokens));
		if (!formRemoveAllTokens.valid) {
			const msg = 'Invalid form';
			console.debug(msg);
			return fail(400, {
				formRemoveAllTokens,
				msg
			});
		}

		try {
			await removeAllTokens(tokenDB);
		} catch (error) {
			const msg = 'Failed to remove all registration tokens';
			console.error(`${msg}: ${error}`);
			return fail(500, {
				formRemoveAllTokens,
				msg
			});
		}

		const msg = 'Successfully removed all tokens';
		return {
			formRemoveAllTokens,
			msg
		};
	}
};
