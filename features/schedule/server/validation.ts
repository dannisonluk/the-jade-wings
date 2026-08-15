import * as XLSX from "xlsx";

import {
	OPERATING_DAYS,
	type FlightSchedule,
	type OperatingDays,
	type ScheduleValidationIssue,
} from "../types";

export type WorkbookRow = unknown[];

type ParsedTime = {
	time: string;
	dayOffset: number;
};

function addIssue(
	issues: ScheduleValidationIssue[],
	source: string,
	row: number,
	field: keyof FlightSchedule,
	message: string,
): void {
	issues.push({ severity: "error", source, row, field, message });
}

function readText(value: unknown): string {
	return value === null || value === undefined ? "" : String(value).trim();
}

function parseExcelDate(value: unknown): string | null {
	if (typeof value === "number") {
		const parsed = XLSX.SSF.parse_date_code(value);
		if (!parsed) return null;
		return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
	}

	const text = readText(value);
	const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
	if (!match) return null;
	const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
	return `${year}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
}

function parseLocalTime(value: unknown): ParsedTime | null {
	const match = readText(value).match(/^(\d{2})(\d{2})([+-]\d+)?$/);
	if (!match) return null;
	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (hours > 23 || minutes > 59) return null;
	return {
		time: `${match[1]}:${match[2]}`,
		dayOffset: match[3] ? Number(match[3]) : 0,
	};
}

function parseOperatingDays(values: unknown[]): OperatingDays | null {
	const days = values.map((value) => readText(value));
	if (days.some((value) => value !== "" && value !== "✓")) return null;
	return Object.fromEntries(
		OPERATING_DAYS.map((day, index) => [day, days[index] === "✓"]),
	) as OperatingDays;
}

export function validateWorkbookRow(
	row: WorkbookRow,
	excelRow: number,
	source: string,
): { record: FlightSchedule | null; issues: ScheduleValidationIssue[] } {
	const issues: ScheduleValidationIssue[] = [];
	const carrier = readText(row[0]).toUpperCase();
	const flightNumber = readText(row[1]).padStart(3, "0");
	const origin = readText(row[2]).toUpperCase();
	const destination = readText(row[3]).toUpperCase();
	const originRegion = readText(row[4]).toUpperCase();
	const destinationRegion = readText(row[5]).toUpperCase() || null;
	const fullItinerary = readText(row[6]).toUpperCase();
	const stops = Number(row[7]);
	const validFrom = parseExcelDate(row[8]);
	const validTo = parseExcelDate(row[9]);
	const operatingDays = parseOperatingDays(row.slice(10, 17));
	const departure = parseLocalTime(row[17]);
	const arrival = parseLocalTime(row[18]);
	const bodyType = readText(row[19]);
	const aircraftType = readText(row[20]).toUpperCase();

	if (!/^[A-Z0-9]{2,3}$/.test(carrier)) {
		addIssue(issues, source, excelRow, "carrier", "Carrier must contain 2-3 letters or digits.");
	}
	if (!/^\d{3,4}$/.test(flightNumber)) {
		addIssue(issues, source, excelRow, "flightNumber", "Flight number must contain 3-4 digits.");
	}
	if (!/^[A-Z]{3}$/.test(origin)) {
		addIssue(issues, source, excelRow, "origin", "Origin must be a three-letter IATA code.");
	}
	if (!/^[A-Z]{3}$/.test(destination)) {
		addIssue(issues, source, excelRow, "destination", "Destination must be a three-letter IATA code.");
	}
	if (!originRegion) {
		addIssue(issues, source, excelRow, "originRegion", "Origin region is required.");
	}
	if (!fullItinerary || !fullItinerary.split("-").includes(origin) || !fullItinerary.split("-").includes(destination)) {
		addIssue(issues, source, excelRow, "fullItinerary", "Full itinerary must contain the origin and destination.");
	}
	if (!Number.isInteger(stops) || stops < 0) {
		addIssue(issues, source, excelRow, "stops", "Stops must be a non-negative integer.");
	}
	if (!validFrom) {
		addIssue(issues, source, excelRow, "validFrom", "Validity From must be a valid Excel date.");
	}
	if (!validTo) {
		addIssue(issues, source, excelRow, "validTo", "Validity To must be a valid Excel date.");
	}
	if (validFrom && validTo && validFrom > validTo) {
		addIssue(issues, source, excelRow, "validTo", "Validity To cannot precede Validity From.");
	}
	if (!operatingDays) {
		addIssue(issues, source, excelRow, "operatingDays", "Operating days contain an unsupported marker.");
	}
	if (!departure) {
		addIssue(issues, source, excelRow, "departureTime", "Departure time must use HHMM with an optional day offset.");
	}
	if (!arrival) {
		addIssue(issues, source, excelRow, "arrivalTime", "Arrival time must use HHMM with an optional day offset.");
	}
	if (!bodyType) {
		addIssue(issues, source, excelRow, "bodyType", "Body type is required.");
	}
	if (!aircraftType) {
		addIssue(issues, source, excelRow, "aircraftType", "Aircraft type is required.");
	}

	if (issues.length || !validFrom || !validTo || !operatingDays || !departure || !arrival) {
		return { record: null, issues };
	}

	return {
		record: {
			carrier,
			flightNumber,
			origin,
			destination,
			pair: `${origin}-${destination}`,
			originRegion,
			destinationRegion,
			fullItinerary,
			stops,
			validFrom,
			validTo,
			operatingDays,
			departureTime: departure.time,
			departureDayOffset: departure.dayOffset,
			arrivalTime: arrival.time,
			arrivalDayOffset: arrival.dayOffset,
			bodyType,
			aircraftType,
		},
		issues,
	};
}

export function scheduleRecordKey(record: FlightSchedule): string {
	return [
		record.carrier,
		record.flightNumber,
		record.pair,
		record.validFrom,
		record.validTo,
		record.departureTime,
		record.departureDayOffset,
		record.arrivalTime,
		record.arrivalDayOffset,
		record.aircraftType,
		JSON.stringify(record.operatingDays),
	].join("|");
}
