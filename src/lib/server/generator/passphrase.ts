import { entropy } from 'eff-diceware-passphrase';

export async function generatePassphrase(): Promise<string> {
	// TODO: Check the password strength and breach status using haveibeenpwnd api
	return entropy(100).join('-');
}
