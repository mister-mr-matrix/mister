import { z } from 'zod/v4';
import { validUnitTime } from '$lib/isotimer/generate';

export const formSchema = z.object({
	description: z.string().default(''),
	expiresInUnit: z.string().refine((e) => validUnitTime(e), { error: 'Invalid expiry value' })
});

export type FormSchema = typeof formSchema;
