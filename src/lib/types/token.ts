export type Token = {
	token: string;
	description: string;
	createdAt: Date | string;
	expiresAt: Date | string;
};

export type TokenData = {
	description: string;
	createdAt: Date | string;
	expiresAt: Date | string;
};
