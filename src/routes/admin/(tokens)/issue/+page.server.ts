import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { createToken } from '$lib/server/db/token.js';
import { convertUnitTimeToSeconds } from '$lib/time/unit.js';
import { generateLabelsAndValues } from '$lib/time/label.js';

export const load: PageServerLoad = async ({ locals: { config } }) => {
	return {
		form: await superValidate(zod4(formSchema)),
		expDateOpts: generateLabelsAndValues(config.expiryOpts)
	};
};

export const actions: Actions = {
	default: async ({ request, locals: { config, tokenDB } }) => {
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
		if (!config.expiryOpts.includes(expiresInUnit)) {
			const msg = 'Expiration date not allowed by the server';
			console.debug(msg);
			return fail(400, {
				form,
				msg
			});
		}

		const token = crypto.randomUUID();
		const ttl = convertUnitTimeToSeconds(expiresInUnit);

		try {
			await createToken(tokenDB, token, description, ttl);
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
