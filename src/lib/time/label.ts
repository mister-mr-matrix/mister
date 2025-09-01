import { convertUnitTimeToSeconds } from './unit';

function calcLabelIn(seconds: number): string {
	// Now that we have the total seconds, we can calculate the other units
	const remainingYears = Math.floor(seconds / (60 * 60 * 24 * 365));
	const remainingMonths = Math.floor((seconds % (60 * 60 * 24 * 365)) / (60 * 60 * 24 * 30));
	const remainingWeeks = Math.floor((seconds % (60 * 60 * 24 * 30)) / (60 * 60 * 24 * 7));
	const remainingDays = Math.floor((seconds % (60 * 60 * 24 * 7)) / (60 * 60 * 24));
	const remainingHours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
	const remainingMinutes = Math.floor((seconds % (60 * 60)) / 60);
	const remainingSeconds = seconds % 60;

	// Handle "Never" case
	if (
		remainingYears === 0 &&
		remainingMonths === 0 &&
		remainingWeeks === 0 &&
		remainingDays === 0 &&
		remainingHours === 0 &&
		remainingMinutes === 0 &&
		remainingSeconds === 0
	) {
		return 'Never';
	}

	// Create labels for each unit
	const yearLabel = remainingYears === 1 ? 'a year' : `${remainingYears} years`;
	const monthLabel = remainingMonths === 1 ? 'a month' : `${remainingMonths} months`;
	const weekLabel = remainingWeeks === 1 ? 'a week' : `${remainingWeeks} weeks`;
	const dayLabel = remainingDays === 1 ? 'a day' : `${remainingDays} days`;
	const hourLabel = remainingHours === 1 ? 'an hour' : `${remainingHours} hours`;
	const minuteLabel = remainingMinutes === 1 ? 'a minute' : `${remainingMinutes} minutes`;
	const secondLabel = remainingSeconds === 1 ? 'a second' : `${remainingSeconds} seconds`;

	// Collect the parts
	const parts: string[] = [];

	if (remainingYears > 0) parts.push(yearLabel);
	if (remainingMonths > 0) parts.push(monthLabel);
	if (remainingWeeks > 0) parts.push(weekLabel);
	if (remainingDays > 0) parts.push(dayLabel);
	if (remainingHours > 0) parts.push(hourLabel);
	if (remainingMinutes > 0) parts.push(minuteLabel);
	if (remainingSeconds > 0) parts.push(secondLabel);

	// If only one part exists
	if (parts.length === 1) {
		return `In ${parts[0]}`;
	}

	// Format the output with commas and "and" before the last unit
	const lastPart = parts.pop();
	return `In ${parts.join(', ')} and ${lastPart}`;
}

export function generateLabelsAndValues(
	input: string | string[]
): { label: string; value: string }[] {
	const times = typeof input === 'string' ? input.split(',') : input;
	return times.map((t) => {
		const s = convertUnitTimeToSeconds(t);
		return {
			label: calcLabelIn(s),
			value: t
		};
	});
}
