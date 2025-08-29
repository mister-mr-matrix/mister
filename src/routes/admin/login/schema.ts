import { z } from 'zod/v4';

export const formSchema = z.object({
	token: z
		.string()
		.min(32, { error: 'Must be at least 32 characters' })
		.max(128, { error: 'Must be at most 128 characters' })
});

export type FormSchema = typeof formSchema;
