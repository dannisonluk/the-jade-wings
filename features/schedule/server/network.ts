import type { FlightSchedule } from "../types";

export type RoutePair = [string, string];

export function getScheduleRoutePairs(schedule: FlightSchedule[]): RoutePair[] {
	return [
		...new Map(
			schedule.map((flight) => {
				const pair = [flight.origin, flight.destination].sort() as RoutePair;
				return [pair.join("-"), pair] as const;
			}),
		).values(),
	];
}
