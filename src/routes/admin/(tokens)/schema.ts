import { z } from 'zod/v4';

export const formSchemaRemoveToken = z.object({
	token: z.string() // Not an actual user input so not needed to be UUIDv4 type (also doesn't work when type is UUIDv4)
});

export type FormSchemaRemoveToken = typeof formSchemaRemoveToken;

export const formSchemaRemoveAllTokens = z.object({});

export type FormSchemaRemoveAllTokens = typeof formSchemaRemoveAllTokens;
