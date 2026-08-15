import * as turf from "@turf/turf";
import Papa from "papaparse";

export type TrackPoint = {
	lat: number;
	lon: number;
	alt?: number;
	spd?: number;
	dir?: number;
	t?: number;
};

type TrackCsvRow = Record<string, string>;

function parseNumber(row: TrackCsvRow, key: string): number | undefined {
	const raw = row[key] ?? row[key.toLowerCase()];
	if (raw === undefined || raw === "") return undefined;
	const value = Number(String(raw).replace(/,/g, ""));
	return Number.isFinite(value) ? value : undefined;
}

export function parseTrackCsv(csvText: string): TrackPoint[] {
	const parsed = Papa.parse<TrackCsvRow>(csvText, {
		header: true,
		dynamicTyping: false,
		skipEmptyLines: true,
	});
	const fatalError = parsed.errors.find(
		(error) => error.type === "Quotes" || error.type === "Delimiter",
	);
	if (fatalError) {
		throw new Error(`Invalid CSV: ${fatalError.message}`);
	}

	const points: TrackPoint[] = [];
	for (const row of parsed.data) {
		const position =
			row.Position ??
			row.position ??
			row[" POS"] ??
			row.pos ??
			row["Position "];
		if (!position) continue;

		const [latitude, longitude] = String(position)
			.trim()
			.replace(/^"|"$/g, "")
			.split(/\s*,\s*/)
			.map(Number);
		if (
			!Number.isFinite(latitude) ||
			!Number.isFinite(longitude) ||
			latitude < -90 ||
			latitude > 90 ||
			longitude < -180 ||
			longitude > 180
		) {
			continue;
		}

		points.push({
			lat: latitude,
			lon: longitude,
			alt: parseNumber(row, "Altitude"),
			spd: parseNumber(row, "Speed"),
			dir: parseNumber(row, "Direction"),
			t: parseNumber(row, "Timestamp") ?? parseNumber(row, "UTC"),
		});
	}

	const uniquePoints = points.filter(
		(point, index, values) =>
			index === 0 ||
			point.lat !== values[index - 1].lat ||
			point.lon !== values[index - 1].lon,
	);
	if (uniquePoints.length < 2) {
		throw new Error("Track must contain at least two valid positions.");
	}

	return uniquePoints;
}

export async function loadTrackCsv(url: string): Promise<TrackPoint[]> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to load track (${response.status}).`);
	}
	return parseTrackCsv(await response.text());
}

export function calculateTrackDistanceKm(track: TrackPoint[]): number {
	if (track.length < 2) return 0;
	const line = turf.lineString(track.map((point) => [point.lon, point.lat]));
	return turf.length(line, { units: "kilometers" });
}

export function computeTrackBearing(from: TrackPoint, to: TrackPoint): number {
	const bearing = turf.bearing([from.lon, from.lat], [to.lon, to.lat]);
	return ((bearing % 360) + 360) % 360;
}
