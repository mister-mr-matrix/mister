import { entropy } from 'eff-diceware-passphrase';

export async function generatePassphrase(): Promise<string> {
	return entropy(100).join('-');
}
