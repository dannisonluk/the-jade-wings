// app/api/flight/[flightNumber]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { promises as fs } from "fs";
import path from "path";

// Domain types
type ExcelPrimitive = string | number | boolean | Date;
type ExcelCellValue = ExcelPrimitive | null | undefined;
type ExcelRowArray = ReadonlyArray<ExcelCellValue>;

interface FlightData {
	date: string;
	from: string;
	to: string;
	aircraft: string;
	flightTime: string;
	std: string;
	atd: string;
	sta: string;
	ata: string;
	status: string;
}

interface CandidateFile {
	airport: string;
	filePath: string;
}
interface FileMeta {
	airport: string;
	filePath: string;
	mtimeMs: number;
	sheetNames: Set<string>;
}

// Config
const airports = ["KIX", "NGO", "FUK", "NRT", "HND", "CTS"] as const;
const baseDir = path.join(process.cwd(), "db", "xlsx", "flown", "NEA");

// In-memory indexes
const sheetIndex = new Map<string, CandidateFile[]>(); // flightNumber -> files
const fileMeta = new Map<string, FileMeta>(); // filePath -> meta
let indexReady: Promise<void> | null = null;

// Helpers
function normFlight(f: string): string {
	return f.trim().toUpperCase();
}

function toHHMM(hours: number, minutes: number): string {
	const h = String(Math.max(0, Math.min(23, hours))).padStart(2, "0");
	const m = String(Math.max(0, Math.min(59, minutes))).padStart(2, "0");
	return `${h}:${m}`;
}

function excelTimeToHHMM(v: ExcelCellValue): string {
	if (v == null || v === "" || v === "-" || v === "--") return "--";
	if (typeof v === "number") {
		// Excel time is fraction of a day; keep only fractional part
		const frac = v % 1;
		const minutesTotal = Math.round(
			(frac >= 0 ? frac : frac + 1) * 24 * 60
		);
		const h = Math.floor(minutesTotal / 60) % 24;
		const m = minutesTotal % 60;
		return toHHMM(h, m);
	}
	if (typeof v === "string") {
		const ampm = v.match(/^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i);
		if (ampm) {
			let h = parseInt(ampm[1]!, 10);
			const m = parseInt(ampm[2]!, 10);
			const p = ampm[3]!.toUpperCase();
			if (p === "PM" && h !== 12) h += 12;
			if (p === "AM" && h === 12) h = 0;
			return toHHMM(h, m);
		}
		const hhmm = v.match(/(\d{1,2}):(\d{2})/);
		if (hhmm) {
			const h = parseInt(hhmm[1]!, 10);
			const m = parseInt(hhmm[2]!, 10);
			return toHHMM(h, m);
		}
		return "--";
	}
	if (v instanceof Date) {
		return toHHMM(v.getHours(), v.getMinutes());
	}
	return "--";
}

function formatExcelDate(v: ExcelCellValue): string {
	if (v == null || v === "") return "N/A";
	if (typeof v === "number") {
		const ms = Date.UTC(1899, 11, 30) + v * 86400000;
		return new Date(ms).toISOString().slice(0, 10);
	}
	if (v instanceof Date) return v.toISOString().slice(0, 10);
	if (typeof v === "string") {
		const d = new Date(v);
		return Number.isNaN(d.getTime()) ? v : d.toISOString().slice(0, 10);
	}
	return "N/A";
}

function s(v: ExcelCellValue): string {
	if (v === null || v === undefined) return "--";
	if (typeof v === "boolean") return v ? "Yes" : "No";
	return String(v);
}

// Typed wrapper around XLSX.utils.sheet_to_json with header: 1
function sheetToRowsHeader1(ws: XLSX.WorkSheet): ExcelRowArray[] {
	// The XLSX types don't capture the tuple nature with header:1, so we cast the array shape,
	// but we don't use any; we assert to ExcelRowArray[], which we defined.
	const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
		header: 1,
		defval: null,
		raw: true,
	});
	// Enforce runtime shape: array of arrays
	return rows.map((r) =>
		Array.isArray(r) ? (r as ExcelRowArray) : ([] as ExcelRowArray)
	);
}

// Index building
async function buildIndex(): Promise<void> {
	sheetIndex.clear();
	fileMeta.clear();

	await Promise.all(
		airports.map(async (airport) => {
			const filePath = path.join(baseDir, `${airport}.xlsx`);
			try {
				const stat = await fs.stat(filePath);
				const buf = await fs.readFile(filePath);
				const wb = XLSX.read(buf, {
					type: "buffer",
					raw: true,
					cellDates: true,
				});

				const sheets = new Set<string>(wb.SheetNames.map(normFlight));
				fileMeta.set(filePath, {
					airport,
					filePath,
					mtimeMs: stat.mtimeMs,
					sheetNames: sheets,
				});

				for (const sheetName of sheets) {
					const list = sheetIndex.get(sheetName) ?? [];
					list.push({ airport, filePath });
					sheetIndex.set(sheetName, list);
				}
			} catch (e) {
				console.warn(
					`[index] Skip ${filePath}: ${(e as Error).message}`
				);
			}
		})
	);
}

function ensureIndex(): Promise<void> {
	if (!indexReady) indexReady = buildIndex();
	return indexReady;
}

function findFilesForFlight(
	flightNumber: string
): ReadonlyArray<CandidateFile> {
	const key = normFlight(flightNumber);
	return sheetIndex.get(key) ?? [];
}

// Reading one sheet from one file
async function readFlightsFromFile(
	filePath: string,
	sheetName: string
): Promise<FlightData[]> {
	const buf = await fs.readFile(filePath);
	const wb = XLSX.read(buf, { type: "buffer", raw: true, cellDates: true });
	const ws = wb.Sheets[normFlight(sheetName)];
	if (!ws) return [];

	const rows = sheetToRowsHeader1(ws);
	const out: FlightData[] = [];

	for (let i = 1; i < rows.length; i++) {
		const r = rows[i];
		if (!r || r.length === 0) continue;

		// r indices are typed as ExcelCellValue | undefined; guard with ?? null
		out.push({
			date: formatExcelDate(r[0] ?? null),
			from: s(r[1] ?? null),
			to: s(r[2] ?? null),
			aircraft: s(r[3] ?? null),
			flightTime: excelTimeToHHMM(r[4] ?? null),
			std: excelTimeToHHMM(r[5] ?? null),
			atd: excelTimeToHHMM(r[6] ?? null),
			sta: excelTimeToHHMM(r[7] ?? null),
			ata: excelTimeToHHMM(r[8] ?? null),
			status: s(r[9] ?? null) || "Scheduled",
		});
	}

	// Sort by ISO date descending
	out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
	return out;
}

// Small response cache
interface CachedResp {
	flights: FlightData[];
	ts: number;
}
const respCache = new Map<string, CachedResp>();
const RESP_TTL = 60_000;

export async function GET(
	_req: NextRequest,
	context: { params: Promise<{ flightNumber: string }> }
) {
	try {
		const { flightNumber } = await context.params;
		const fn = normFlight(flightNumber);

		await ensureIndex();

		const cached = respCache.get(fn);
		if (cached && Date.now() - cached.ts < RESP_TTL) {
			return NextResponse.json({
				flightNumber: fn,
				flights: cached.flights,
			});
		}

		const candidates = findFilesForFlight(fn);
		if (candidates.length === 0) {
			return NextResponse.json(
				{ error: "Flight not found" },
				{ status: 404 }
			);
		}

		const results = await Promise.all(
			candidates.map(({ filePath }) => readFlightsFromFile(filePath, fn))
		);
		const flights = results.flat();

		if (flights.length === 0) {
			return NextResponse.json(
				{ error: "Flight not found" },
				{ status: 404 }
			);
		}

		respCache.set(fn, { flights, ts: Date.now() });
		return NextResponse.json({ flightNumber: fn, flights });
	} catch (e) {
		console.error("Error fetching flight data:", e);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
