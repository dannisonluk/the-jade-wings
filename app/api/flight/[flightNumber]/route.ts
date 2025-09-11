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

interface FlightMetadata {
	region: string;
	origin: string;
	layover: string;
	destination: string;
	port: string;
}

interface CandidateFile {
	airport: string;
	filePath: string;
	region: string;
}

interface FileMeta {
	airport: string;
	filePath: string;
	region: string;
	mtimeMs: number;
	sheetNames: Set<string>;
}

// Load flight metadata from JSON
const flightMetadataMap: Map<string, FlightMetadata> = new Map();
let metadataReady: Promise<void> | null = null;

async function loadFlightMetadata(): Promise<void> {
	try {
		// Updated path to match your structure
		const metadataPath = path.join(
			process.cwd(),
			"db",
			"json",
			"schedule",
			"mapper",
			"flight_number_region_port.json"
		);
		const data = await fs.readFile(metadataPath, "utf-8");
		const parsed = JSON.parse(data) as Record<string, FlightMetadata>;

		flightMetadataMap.clear();
		for (const [flightNumber, metadata] of Object.entries(parsed)) {
			flightMetadataMap.set(normFlight(flightNumber), metadata);
		}

		console.log(`Loaded metadata for ${flightMetadataMap.size} flights`);
	} catch (error) {
		console.error("Failed to load flight metadata:", error);
		// Fallback to empty map if metadata file doesn't exist
		flightMetadataMap.clear();
	}
}

function ensureMetadata(): Promise<void> {
	if (!metadataReady) metadataReady = loadFlightMetadata();
	return metadataReady;
}

// Config - base directory for XLSX files
const baseDir = path.join(process.cwd(), "db", "xlsx", "flown");

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
	const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
		header: 1,
		defval: null,
		raw: true,
	});
	return rows.map((r) =>
		Array.isArray(r) ? (r as ExcelRowArray) : ([] as ExcelRowArray)
	);
}

// Get unique regions and ports from metadata
function getRegionsAndPorts(): {
	regions: Set<string>;
	portsByRegion: Map<string, Set<string>>;
} {
	const regions = new Set<string>();
	const portsByRegion = new Map<string, Set<string>>();

	for (const metadata of flightMetadataMap.values()) {
		regions.add(metadata.region);

		const ports = portsByRegion.get(metadata.region) || new Set<string>();
		ports.add(metadata.port);
		portsByRegion.set(metadata.region, ports);
	}

	return { regions, portsByRegion };
}

// Index building - now dynamic based on metadata
async function buildIndex(): Promise<void> {
	sheetIndex.clear();
	fileMeta.clear();

	// Ensure metadata is loaded first
	await ensureMetadata();

	const { portsByRegion } = getRegionsAndPorts();

	// Build index for each region and its ports
	const indexPromises: Promise<void>[] = [];

	for (const [region, ports] of portsByRegion.entries()) {
		for (const port of ports) {
			indexPromises.push(indexPortFile(region, port));
		}
	}

	await Promise.all(indexPromises);

	console.log(
		`Index built: ${sheetIndex.size} flight sheets across ${fileMeta.size} files`
	);
}

async function indexPortFile(region: string, port: string): Promise<void> {
	const filePath = path.join(baseDir, region, `${port}.xlsx`);

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
			airport: port,
			filePath,
			region,
			mtimeMs: stat.mtimeMs,
			sheetNames: sheets,
		});

		for (const sheetName of sheets) {
			const list = sheetIndex.get(sheetName) ?? [];
			list.push({ airport: port, filePath, region });
			sheetIndex.set(sheetName, list);
		}

		console.log(`Indexed ${filePath}: ${sheets.size} sheets`);
	} catch (e) {
		console.warn(`[index] Skip ${filePath}: ${(e as Error).message}`);
	}
}

function ensureIndex(): Promise<void> {
	if (!indexReady) indexReady = buildIndex();
	return indexReady;
}

// Smart file finding using metadata
function findFilesForFlight(
	flightNumber: string
): ReadonlyArray<CandidateFile> {
	const key = normFlight(flightNumber);

	// First, try to use metadata to find the exact file
	const metadata = flightMetadataMap.get(key);
	if (metadata) {
		const targetPath = path.join(
			baseDir,
			metadata.region,
			`${metadata.port}.xlsx`
		);
		const meta = fileMeta.get(targetPath);

		if (meta && meta.sheetNames.has(key)) {
			// Found exact match using metadata
			return [
				{
					airport: metadata.port,
					filePath: targetPath,
					region: metadata.region,
				},
			];
		}
	}

	// Fallback to index search if metadata doesn't yield results
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

// Response cache with metadata awareness
interface CachedResp {
	flights: FlightData[];
	metadata?: FlightMetadata;
	ts: number;
}
const respCache = new Map<string, CachedResp>();
const RESP_TTL = 60_000;

// Force reload indexes if metadata changes - INTERNAL ONLY, not exported
async function reloadIndexes(): Promise<void> {
	metadataReady = null;
	indexReady = null;
	respCache.clear();
	await ensureMetadata();
	await ensureIndex();
}

// Optional: Watch for metadata file changes in development
if (process.env.NODE_ENV === "development") {
	const metadataPath = path.join(
		process.cwd(),
		"db",
		"json",
		"schedule",
		"mapper",
		"flight_number_region_port.json"
	);

	// Check if file has changed periodically in dev mode
	let lastMtime = 0;
	setInterval(async () => {
		try {
			const stat = await fs.stat(metadataPath);
			if (stat.mtimeMs > lastMtime) {
				lastMtime = stat.mtimeMs;
				console.log("Flight metadata changed, reloading...");
				await reloadIndexes();
			}
		} catch (e) {
			// File might not exist yet
		}
	}, 5000); // Check every 5 seconds in dev mode
}

export async function GET(
	_req: NextRequest,
	context: { params: Promise<{ flightNumber: string }> }
) {
	try {
		const { flightNumber } = await context.params;
		const fn = normFlight(flightNumber);

		// Ensure both metadata and index are ready
		await ensureMetadata();
		await ensureIndex();

		// Check cache
		const cached = respCache.get(fn);
		if (cached && Date.now() - cached.ts < RESP_TTL) {
			return NextResponse.json({
				flightNumber: fn,
				flights: cached.flights,
				metadata: cached.metadata,
			});
		}

		// Get metadata for this flight
		const metadata = flightMetadataMap.get(fn);

		// Find files containing this flight
		const candidates = findFilesForFlight(fn);
		if (candidates.length === 0) {
			return NextResponse.json(
				{
					error: "Flight not found",
					hint: metadata
						? `Expected in ${metadata.region}/${metadata.port}.xlsx`
						: "No metadata available for this flight",
				},
				{ status: 404 }
			);
		}

		// Read flight data from all candidate files
		const results = await Promise.all(
			candidates.map(({ filePath }) => readFlightsFromFile(filePath, fn))
		);
		const flights = results.flat();

		if (flights.length === 0) {
			return NextResponse.json(
				{
					error: "No flight data found",
					hint: metadata
						? `Sheet exists but contains no data in ${metadata.region}/${metadata.port}.xlsx`
						: undefined,
				},
				{ status: 404 }
			);
		}

		// Cache the response
		respCache.set(fn, { flights, metadata, ts: Date.now() });

		return NextResponse.json({
			flightNumber: fn,
			flights,
			metadata,
			source: candidates.map((c) => ({
				airport: c.airport,
				region: c.region,
			})),
		});
	} catch (e) {
		console.error("Error fetching flight data:", e);
		return NextResponse.json(
			{ error: "Internal server error", details: (e as Error).message },
			{ status: 500 }
		);
	}
}
