type Datey = number | string | Date;

export function timeNow(): Date {
	return new Date(timeNowN());
}

export function timeNowN(): number {
	return Date.now();
}

export function timeOffset(init: Datey, offset: number): Date {
	return new Date(new Date(init).getTime() + offset);
}

export function timeDelta(timeA: Datey, timeB: Datey): number {
	return Math.abs(new Date(timeA).getTime() - new Date(timeB).getTime());
}

export function timeToSeconds(time: Datey): number {
	return Math.round(new Date(time).getTime() / 1000);
}

export function timeFromSeconds(seconds: number): Date {
	return new Date(timeFromSecondsN(seconds));
}

export function timeFromSecondsN(seconds: number): number {
	return seconds * 1000;
}

export function timeCompare(greater: Datey, lower: Datey): boolean {
	return new Date(greater) > new Date(lower);
}
