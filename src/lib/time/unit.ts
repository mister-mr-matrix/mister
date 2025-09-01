import { timeFromSecondsN, timeNow, timeOffset } from '$lib/time/utils';

const unitTimeRegex = /^(\d+)([smhdwMyY])$/;

export function validUnitTime(input: string): boolean {
	return input.match(unitTimeRegex) !== null;
}

export function extractUnitTime(input: string): { value: number; unit: string } {
	const match = input.match(unitTimeRegex);
	if (!match) {
		throw new Error('Invalid unit time format');
	}

	return {
		value: Number.parseInt(match[1], 10), // Get the numeric value
		unit: match[2] // Get the unit (s, m, d, w, M, y)
	};
}

export function convertUnitTimeToSeconds(input: string): number {
	const { value, unit } = extractUnitTime(input);

	switch (unit) {
		case 's': // Seconds
			return value;
		case 'm': // Minutes
			return value * 60;
		case 'h': // Hours
			return value * 60 * 60;
		case 'd': // Days
			return value * 60 * 60 * 24;
		case 'w': // Weeks
			return value * 60 * 60 * 24 * 7;
		case 'M': // Months
			return value * 60 * 60 * 24 * 30;
		case 'y': // Years
		case 'Y': // Years (support for both 'y' and 'Y')
			return value * 60 * 60 * 24 * 365;
		default:
			throw new Error('Unsupported unit');
	}
}

export function convertUnitTimeToExpiryDate(input: string): Date {
	return timeOffset(timeNow(), timeFromSecondsN(convertUnitTimeToSeconds(input)));
}
