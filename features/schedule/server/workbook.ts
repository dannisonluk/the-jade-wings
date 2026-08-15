import * as XLSX from "xlsx";

import type {
	FlightSchedule,
	ScheduleValidationIssue,
} from "../types";
import {
	scheduleRecordKey,
	validateWorkbookRow,
	type WorkbookRow,
} from "./validation";

const EXPECTED_HEADERS = [
	"Carrier Code",
	"Flight No",
	"Origin",
	"Destination",
	"ORG Region",
	"DEST Region",
	"Full Itinerary",
	"No. of stops",
	"Validity From",
	"Validity To",
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Dep. Time",
	"Arr. Time",
	"Body type",
	"Aircraft Type",
] as const;

export interface ParsedScheduleWorkbook {
	records: FlightSchedule[];
	issues: ScheduleValidationIssue[];
	rawRecordCount: number;
	sheet: string;
	title: string;
	schedulePeriod: string;
	dataCorrectAsOf: string | null;
	disclaimer: string;
}

function text(value: unknown): string {
	return value === null || value === undefined ? "" : String(value).trim();
}

function toHktIso(value: string): string | null {
	const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i);
	if (!match) return null;
	let hour = Number(match[4]) % 12;
	if (match[6].toUpperCase() === "PM") hour += 12;
	return new Date(
		Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]), hour - 8, Number(match[5])),
	).toISOString();
}

export function parseScheduleWorkbook(
	buffer: Buffer,
	source: string,
): ParsedScheduleWorkbook {
	const workbook = XLSX.read(buffer, { type: "buffer", raw: true, cellDates: false });
	const sheetName = workbook.SheetNames.includes("TimeTable")
		? "TimeTable"
		: workbook.SheetNames[0];
	if (!sheetName) throw new Error("Workbook has no worksheets.");

	const sheet = workbook.Sheets[sheetName];
	const rows = XLSX.utils.sheet_to_json<WorkbookRow>(sheet, {
		header: 1,
		raw: true,
		defval: null,
		blankrows: false,
	});
	const header = rows[5] ?? [];
	const headerMatches = EXPECTED_HEADERS.every(
		(expected, index) => text(header[index]) === expected,
	);
	if (!headerMatches) {
		throw new Error("Workbook header does not match the Cathay Cargo timetable schema.");
	}

	const issues: ScheduleValidationIssue[] = [];
	const accepted = new Map<string, FlightSchedule>();
	const dataRows = rows.slice(6).filter((row) => row.some((value) => value !== null));
	dataRows.forEach((row, index) => {
		const result = validateWorkbookRow(row, index + 7, source);
		issues.push(...result.issues);
		if (!result.record) return;
		const key = scheduleRecordKey(result.record);
		if (accepted.has(key)) {
			issues.push({
				severity: "warning",
				source,
				row: index + 7,
				message: `${result.record.carrier}${result.record.flightNumber} ${result.record.pair} duplicates another workbook row.`,
			});
			return;
		}
		accepted.set(key, result.record);
	});

	return {
		records: [...accepted.values()],
		issues,
		rawRecordCount: dataRows.length,
		sheet: sheetName,
		title: text(rows[0]?.[10]) || "Cathay Flight Schedules",
		schedulePeriod: text(rows[1]?.[12]),
		dataCorrectAsOf: toHktIso(text(rows[2]?.[12])),
		disclaimer: text(rows[4]?.[10]).replace(/^\*/, ""),
	};
}
