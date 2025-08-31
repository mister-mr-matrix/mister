import type { PageServerLoad, Actions } from './$types.js';
import { env } from '$env/dynamic/public';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { validToken, removeToken } from '$lib/server/db/token.js';
import { generateUsername } from '$lib/server/generator/username.js';
import { generatePassphrase } from '$lib/server/generator/passphrase.js';
import { registerUser } from '$lib/server/matrix/register.js';
import { availableUsername } from '$lib/server/matrix/available.js';
import { matrixHandle } from '$lib/server/generator/matrix-handle.js';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	const form =
		token === null
			? await superValidate(zod4(formSchema))
			: await superValidate({ token }, zod4(formSchema));

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ request, locals: { tokenDB } }) => {
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
		const okToken = await validToken(tokenDB, token);
		if (!okToken) {
			const msg = 'Invalid or expired registration token';
			console.debug(msg);
			return fail(400, {
				form,
				msg
			});
		}

		let username = form.data.username ?? '';
		let passphrase = form.data.password ?? '';

		if (env.PUBLIC_MR_RANDOM_USERNAME === 'true') {
			try {
				username = await generateUsername();
			} catch (error) {
				const msg = 'Failed to generate the username';
				console.error(`${msg}: ${error}`);
				return fail(500, {
					form,
					msg
				});
			}
		} else {
			const ok = await availableUsername(username);
			if (!ok) {
				const msg = 'Username is already taken';
				console.error(msg);
				return fail(400, {
					form,
					msg
				});
			}
		}

		if (env.PUBLIC_MR_RANDOM_PASSWORD === 'true') {
			try {
				passphrase = await generatePassphrase();
			} catch (error) {
				const msg = 'Failed to generate the passphrase';
				console.error(`${msg}: ${error}`);
				return fail(500, {
					form,
					msg
				});
			}
		}

		try {
			const success = await registerUser({ username, passphrase });
			if (!success) {
				throw new Error('Register user returned false');
			}
		} catch (error) {
			const msg = 'Failed to register the user';
			console.error(`${msg}: ${error}`);
			return fail(500, {
				form,
				msg
			});
		}

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

		const msg = 'Successfully created new credentials';
		return {
			form,
			msg,
			credetials: {
				username: matrixHandle(username),
				passphrase
			}
		};
	}
};
