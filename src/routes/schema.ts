import { env } from '$env/dynamic/public';
import { z } from 'zod/v4';

export const formSchema = z.object({
	token: z.uuidv4({ error: 'Invalid input, make sure you have entered it correctly.' }),
	username: env.PUBLIC_MR_RANDOM_USERNAME === 'true' ? z.string().optional() : z.string(),
	password: env.PUBLIC_MR_RANDOM_PASSWORD === 'true' ? z.string().optional() : z.string()
});

export type FormSchema = typeof formSchema;
