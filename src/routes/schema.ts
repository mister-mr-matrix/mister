import { z } from 'zod/v4';

export const formSchema = z.object({
	token: z.uuidv4({ error: 'Invalid input, make sure you have entered it correctly.' })
});

export type FormSchema = typeof formSchema;
