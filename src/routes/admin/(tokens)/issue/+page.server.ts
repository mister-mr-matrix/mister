import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { createToken } from '$lib/server/db/token.js';
import { convertUnitTimeToExpiryDate, generateLabelsAndValues } from '$lib/isotimer/generate.js';
import { expiryOptions } from '$lib/server/env/expiry.js';

export const load: PageServerLoad = async () => {
	const expDateOpts = generateLabelsAndValues(expiryOptions());

	return {
		form: await superValidate(zod4(formSchema)),
		expDateOpts
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

		const { description, expiresInUnit } = form.data;
		if (!expiryOptions().includes(expiresInUnit)) {
			const msg = 'Expiration date not allowed by the server';
			console.debug(msg);
			return fail(400, {
				form,
				msg
			});
		}

		const expiresAt = convertUnitTimeToExpiryDate(expiresInUnit);
		const token = crypto.randomUUID();

		try {
			await createToken(tokenDB, token, description, expiresAt);
		} catch (error) {
			const msg = 'Failed to issue a registration token';
			console.error(`${msg}: ${error}`);
			return fail(500, {
				form,
				msg
			});
		}

		const msg = 'Successfully issued a new token';
		return {
			form,
			msg
		};
	}
};
