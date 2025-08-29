import { hash, verify } from 'argon2';

export async function hashPassword(password: string): Promise<string> {
	if (password === '') {
		throw new Error('Password must not be empty string');
	}

	return await hash(password);
}

export async function verifyPasswordHash(hash: string, password: string): Promise<boolean> {
	if (hash === '') {
		throw new Error('Hash must not be empty string');
	}

	if (password === '') {
		throw new Error('Password must not be empty string');
	}

	return await verify(hash, password);
}
