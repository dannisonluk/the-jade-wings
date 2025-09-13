"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type { FeatureCollection, LineString, Point, Feature } from "geojson";
import Papa from "papaparse";

type TrackPoint = {
	lat: number;
	lon: number;
	alt?: number; // feet
	spd?: number; // knots
	dir?: number; // degrees
	t?: number; // timestamp (not displayed)
};

const HK: [number, number] = [114.1694, 22.3193];
const DEFAULT_FILE = "EUR/CDG/CX261 - 13Sep2025.csv";

// Brand palette
const COLORS = {
	primary: "#2D7FF9",
	primaryDark: "#1B5FD9",
	accent: "#FFD166",
	success: "#2ED573",
	info: "#60A5FA",
	bg: "#0B1220",
	card: "#121A2B",
	muted: "#8FA0B9",
	line: "#7EE1FF",
	trail: "#FFD166",
};

// Tunables for layout without sticky bars
const MAP_VH = 52; // map block height in viewport height
const MAP_MIN = 420; // px fallback for small devices

// Utilities
function km(nm: number) {
	return nm * 1.852;
}
function calcTotalDistanceKm(track: TrackPoint[]) {
	if (track.length < 2) return 0;
	const line = {
		type: "Feature",
		geometry: {
			type: "LineString",
			coordinates: track.map((p) => [p.lon, p.lat]),
		},
		properties: {},
	} as Feature<LineString>;
	const lenNm = turf.length(line, { units: "nauticalmiles" });
	return km(lenNm);
}
function computeBearings(points: TrackPoint[]): number[] {
	const bearings: number[] = [];
	for (let i = 0; i < points.length; i++) {
		const d = points[i].dir;
		if (typeof d === "number" && Number.isFinite(d)) {
			bearings.push(((d % 360) + 360) % 360);
		} else {
			const a = points[Math.max(0, i - 1)];
			const b = points[Math.min(points.length - 1, i + 1)];
			const brg = turf.bearing([a.lon, a.lat], [b.lon, b.lat]);
			bearings.push(((brg % 360) + 360) % 360);
		}
	}
	return bearings;
}

// Parse destination (IATA) and date from the API file path
function parseDestAndDateFromFile(filePath: string): {
	dest: string;
	dateText: string;
} {
	// Example: EUR/CDG/CX261 - 13Sep2025.csv
	const parts = filePath.split("/");
	const dest = (parts[1] || "").toUpperCase() || "—";

	// Get filename without extension
	const fileName = parts[parts.length - 1] || "";
	// Expect pattern "... - 13Sep2025.csv"
	const match = fileName.match(/-\s*([0-3]?\d)([A-Za-z]{3})(20\d{2})/);
	if (!match) return { dest, dateText: "—" };

	const day = match[1];
	const mon = match[2];
	const year = match[3];
	// Format like "13 Sep 2025"
	const dateText = `${day} ${mon.slice(0, 1).toUpperCase()}${mon
		.slice(1, 3)
		.toLowerCase()} ${year}`;
	return { dest, dateText };
}

export default function FlightPlayback() {
	const file = DEFAULT_FILE;
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);

	const [track, setTrack] = useState<TrackPoint[]>([]);
	const [bearings, setBearings] = useState<number[]>([]);
	const [idx, setIdx] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [playing, setPlaying] = useState(false);
	const [iconLoaded, setIconLoaded] = useState(false);
	const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
	const [follow, setFollow] = useState(true);

	// Derived from API file path (destination + date)
	const { dest, dateText } = parseDestAndDateFromFile(file);

	// Load CSV once (track only; no callsign needed)
	useEffect(() => {
		setError(null);
		setTrack([]);
		setIdx(0);
		const url = `/api/route/flightradar24?file=${encodeURIComponent(file)}`;
		(async () => {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to load CSV (${res.status})`);
			const csvText = await res.text();

			const parsed = Papa.parse<Record<string, string>>(csvText, {
				header: true,
				dynamicTyping: false,
				skipEmptyLines: true,
			});

			const pts: TrackPoint[] = [];
			for (const r of parsed.data) {
				if (!r) continue;
				const posRaw =
					r["Position"] ??
					r["position"] ??
					r[" POS"] ??
					r["pos"] ??
					r["Position "];
				if (!posRaw) continue;

				const trimmed = String(posRaw).trim().replace(/^"|"$/g, "");
				if (!trimmed.includes(",")) continue;
				const [latStr, lonStr] = trimmed.split(/\s*,\s*/);
				const lat = Number(latStr);
				const lon = Number(lonStr);
				if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

				const tp: TrackPoint = { lat, lon };

				const altRaw = r["Altitude"] ?? r["altitude"];
				if (altRaw !== undefined && altRaw !== "") {
					const v = Number(String(altRaw).replace(/,/g, ""));
					if (Number.isFinite(v)) tp.alt = v;
				}

				const spdRaw = r["Speed"] ?? r["speed"];
				if (spdRaw !== undefined && spdRaw !== "") {
					const v = Number(String(spdRaw).replace(/,/g, ""));
					if (Number.isFinite(v)) tp.spd = v;
				}

				const dirRaw = r["Direction"] ?? r["direction"];
				if (dirRaw !== undefined && dirRaw !== "") {
					const v = Number(String(dirRaw).replace(/,/g, ""));
					if (Number.isFinite(v)) tp.dir = ((v % 360) + 360) % 360;
				}

				const tsRaw =
					r["Timestamp"] ?? r["timestamp"] ?? r["UTC"] ?? r["utc"];
				if (tsRaw !== undefined && tsRaw !== "") {
					const v = Number(String(tsRaw).replace(/[^0-9.-]/g, ""));
					if (Number.isFinite(v)) tp.t = v;
				}

				pts.push(tp);
			}

			const cleaned = pts.filter(
				(p, i, arr) =>
					i === 0 ||
					p.lat !== arr[i - 1].lat ||
					p.lon !== arr[i - 1].lon
			);

			if (cleaned.length < 2) throw new Error("Not enough points in CSV");

			setTrack(cleaned);
			setBearings(computeBearings(cleaned));
		})().catch((e) => setError(e.message));
	}, [file]);

	// GeoJSON
	const lineFC: FeatureCollection<LineString> | null = useMemo(() => {
		if (track.length < 2) return null;
		return {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					properties: {},
					geometry: {
						type: "LineString",
						coordinates: track.map((p) => [p.lon, p.lat]),
					},
				},
			],
		};
	}, [track]);

	const pointFC: FeatureCollection<Point> | null = useMemo(() => {
		if (!track.length) return null;
		const i = Math.min(idx, track.length - 1);
		const p = track[i];
		return {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					properties: {
						bearing: bearings[i] ?? 0,
						speed: p.spd ?? 0,
						altitude: p.alt ?? 0,
					},
					geometry: { type: "Point", coordinates: [p.lon, p.lat] },
				},
			],
		};
	}, [track, idx, bearings]);

	// Map init
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
		if (!token) {
			console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
			return;
		}
		mapboxgl.accessToken = token;

		const map = new mapboxgl.Map({
			container: el,
			style: "mapbox://styles/mapbox/standard",
			center: HK as LngLatLike,
			zoom: 4,
			projection: "globe",
			antialias: true,
		});
		mapRef.current = map;

		// Read final size after layout
		setTimeout(() => map.resize(), 0);

		map.on("style.load", () => {
			map.setFog({
				color: "hsl(218, 32%, 14%)",
				"high-color": "hsl(216, 25%, 20%)",
				"horizon-blend": 0.04,
				"space-color": "#000000",
				"star-intensity": 0.0,
			});
		});

		map.on("load", () => {
			// Sources
			map.addSource("flight-line", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: [],
				} as FeatureCollection,
			});
			map.addSource("flight-trail", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: [],
				} as FeatureCollection,
			});
			map.addSource("flight-point", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: [],
				} as FeatureCollection,
			});

			// Base route
			map.addLayer({
				id: "flight-line",
				type: "line",
				source: "flight-line",
				paint: {
					"line-width": 3,
					"line-color": COLORS.line,
					"line-opacity": 0.9,
					"line-emissive-strength": 0.7,
				},
			});

			// Glow
			map.addLayer({
				id: "flight-line-glow",
				type: "line",
				source: "flight-line",
				paint: {
					"line-width": 9,
					"line-color": COLORS.line,
					"line-opacity": 0.18,
					"line-blur": 2.5,
					"line-emissive-strength": 0.25,
				},
			});

			// Flown trail
			map.addLayer({
				id: "flight-trail",
				type: "line",
				source: "flight-trail",
				paint: {
					"line-width": 3.5,
					"line-color": COLORS.trail,
					"line-opacity": 0.95,
					"line-emissive-strength": 0.9,
				},
			});

			// Plane icon
			const img = new Image();
			img.src = "/images/icons/route/aircraft.png";
			img.onload = () => {
				if (!map.hasImage("plane-icon")) {
					map.addImage("plane-icon", img, { pixelRatio: 2 });
				}
				map.addLayer({
					id: "flight-point",
					type: "symbol",
					source: "flight-point",
					layout: {
						"icon-image": "plane-icon",
						"icon-size": 0.35,
						"icon-allow-overlap": true,
						"icon-rotation-alignment": "map",
						"icon-rotate": ["get", "bearing"],
					},
				});
				setIconLoaded(true);
			};
			img.onerror = (e) => console.error("Failed to load plane image", e);
		});

		const onResize = () => map.resize();
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			map.remove();
		};
	}, []);

	// Push line + fit bounds
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !map.isStyleLoaded() || !lineFC) return;
		(
			map.getSource("flight-line") as mapboxgl.GeoJSONSource | undefined
		)?.setData(lineFC);
		const line = lineFC.features[0] as Feature<LineString>;
		const bbox = turf.bbox(line);
		map.fitBounds(bbox as mapboxgl.LngLatBoundsLike, {
			padding: 48,
			duration: 600,
		});
	}, [lineFC]);

	// Trail + follow
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !map.isStyleLoaded() || !track.length) return;
		const i = Math.min(idx, track.length - 1);
		const coords = track.slice(0, i + 1).map((p) => [p.lon, p.lat]);
		const trail: FeatureCollection<LineString> = {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					properties: {},
					geometry: { type: "LineString", coordinates: coords },
				},
			],
		};
		(
			map.getSource("flight-trail") as mapboxgl.GeoJSONSource | undefined
		)?.setData(trail);

		if (follow && coords.length) {
			const lngLat = coords[coords.length - 1] as [number, number];
			map.easeTo({
				center: lngLat,
				bearing: bearings[i] ?? map.getBearing(),
				duration: 450,
				easing: (t) => 1 - Math.pow(1 - t, 3),
			});
		}
	}, [idx, track, follow, bearings]);

	// Point
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !map.isStyleLoaded() || !pointFC || !iconLoaded) return;
		(
			map.getSource("flight-point") as mapboxgl.GeoJSONSource | undefined
		)?.setData(pointFC);
	}, [pointFC, iconLoaded]);

	// Playback
	const maxIdx = Math.max(0, track.length - 1);
	const at = track[Math.min(idx, maxIdx)];

	useEffect(() => {
		if (!playing) return;
		let raf = 0;
		let last = performance.now();
		const step = (now: number) => {
			const dt = now - last;
			if (dt > 60 / Math.max(0.25, Math.min(4, speed))) {
				setIdx((i) => (i >= maxIdx ? i : i + 1));
				last = now;
			}
			raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [playing, maxIdx, speed]);

	useEffect(() => {
		if (idx >= maxIdx && playing) setPlaying(false);
	}, [idx, maxIdx, playing]);

	// Shortcuts (optional)
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === " " || e.key === "k") {
				e.preventDefault();
				setPlaying((p) => !p);
			} else if (e.key === "ArrowRight") {
				setIdx((i) => Math.min(i + 5, maxIdx));
			} else if (e.key === "ArrowLeft") {
				setIdx((i) => Math.max(i - 5, 0));
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [maxIdx]);

	// Derived display
	const heading = (bearings[Math.min(idx, maxIdx)] ?? 0).toFixed(0);
	const spd = Math.round(at?.spd ?? 0);
	const alt = Math.round(at?.alt ?? 0);
	const progressPct = track.length
		? (idx / Math.max(1, track.length - 1)) * 100
		: 0;

	return (
		<div
			className="w-full"
			style={{ background: COLORS.bg }}
		>
			{/* Controls row */}
			<div
				className="px-4 pt-3 pb-2"
				style={{
					background: COLORS.card,
					borderBottom: "1px solid #1B2336",
				}}
			>
				<div className="flex items-center gap-3">
					<button
						onClick={() => setPlaying(true)}
						className="h-9 px-3 rounded-md text-white text-sm font-medium"
						style={{ background: COLORS.primary }}
					>
						Play
					</button>
					<button
						onClick={() => setPlaying(false)}
						className="h-9 px-3 rounded-md text-white/90 text-sm border"
						style={{
							background: "#0F1726",
							borderColor: "#1B2336",
						}}
					>
						Pause
					</button>

					<label
						className="flex items-center gap-2 text-xs ml-2"
						style={{ color: COLORS.muted }}
					>
						<input
							type="checkbox"
							checked={follow}
							onChange={(e) => setFollow(e.target.checked)}
						/>
						Follow
					</label>

					<div className="ml-auto flex items-center gap-2">
						{([1, 2, 4] as const).map((s) => (
							<button
								key={s}
								onClick={() => setSpeed(s)}
								className="h-9 px-2.5 rounded-md text-xs font-medium border"
								style={{
									background:
										speed === s ? COLORS.accent : "#0F1726",
									color: speed === s ? "#1A1F2B" : "#E6F0FF",
									borderColor: "#1B2336",
								}}
							>
								{s}x
							</button>
						))}
					</div>
				</div>

				{/* Scrubber */}
				<div className="mt-2">
					<input
						type="range"
						min={0}
						max={Math.max(0, track.length - 1)}
						value={Math.min(idx, Math.max(0, track.length - 1))}
						onChange={(e) => setIdx(Number(e.target.value))}
						className="w-full h-2"
						style={{ accentColor: COLORS.accent }}
					/>
					<div className="mt-1 flex justify-between">
						{Array.from({ length: 12 }).map((_, i) => (
							<span
								key={i}
								className="w-px h-1"
								style={{ background: "#223047" }}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Map */}
			<div
				className="relative w-full"
				style={{
					height: `min(${MAP_VH}vh, 700px)`,
					minHeight: MAP_MIN,
				}}
			>
				<div
					ref={containerRef}
					className="absolute inset-0 overflow-hidden [&_.mapboxgl-canvas]:!w-full [&_.mapboxgl-canvas]:!h-full"
				/>
				<div
					className="absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-medium"
					style={{
						background: "#1E2B45",
						color: "#E6F0FF",
						border: "1px solid #243352",
					}}
				>
					{error
						? `Error: ${error}`
						: track.length
						? `${at.lat?.toFixed(4)}, ${at.lon?.toFixed(
								4
						  )} • hdg ${heading}° • spd ${spd} kt • alt ${alt} ft`
						: "Loading..."}
				</div>
			</div>

			{/* Minimal summary under map: date, origin HKG, destination from API path */}
			<section
				className="px-4 py-3"
				style={{ background: COLORS.bg }}
			>
				<div className="text-white/95 text-sm">
					Reference: {dateText}  (Historical Flight)
				</div>
				<div className="mt-1 grid grid-cols-2 gap-x-6 text-sm text-white/90">
					<div>Origin: HKG</div>
					<div>Destination: {dest}</div>
				</div>
				<div
					className="mt-3 h-px"
					style={{ background: "#1B2336" }}
				/>
			</section>

			{/* Flight details card (unchanged visuals, aligned under summary) */}
			<section
				className="px-4 pb-6"
				style={{ background: COLORS.bg }}
			>
				<div className="text-white text-base font-semibold mb-2">
					Flight Details
				</div>
				<div
					className="rounded-xl p-3 border"
					style={{ background: COLORS.card, borderColor: "#1B2336" }}
				>
					<div className="grid grid-cols-2 gap-3 text-[13px]">
						<div
							className="rounded-lg p-3"
							style={{
								background: "#0F1726",
								border: "1px solid #1B2336",
							}}
						>
							<div
								className="text-[11px]"
								style={{ color: COLORS.muted }}
							>
								Distance
							</div>
							<div className="text-white font-semibold">
								{calcTotalDistanceKm(track).toFixed(0)} km
							</div>
						</div>
						<div
							className="rounded-lg p-3"
							style={{
								background: "#0F1726",
								border: "1px solid #1B2336",
							}}
						>
							<div
								className="text-[11px]"
								style={{ color: COLORS.muted }}
							>
								Progress
							</div>
							<div className="text-white font-semibold">
								{track.length
									? (
											(idx /
												Math.max(1, track.length - 1)) *
											100
									  ).toFixed(0)
									: 0}
								%
							</div>
						</div>
						<div
							className="rounded-lg p-3"
							style={{
								background: "#0F1726",
								border: "1px solid #1B2336",
							}}
						>
							<div
								className="text-[11px]"
								style={{ color: COLORS.muted }}
							>
								Groundspeed
							</div>
							<div className="text-white font-semibold">
								{spd} kt
							</div>
						</div>
						<div
							className="rounded-lg p-3"
							style={{
								background: "#0F1726",
								border: "1px solid #1B2336",
							}}
						>
							<div
								className="text-[11px]"
								style={{ color: COLORS.muted }}
							>
								Altitude
							</div>
							<div className="text-white font-semibold">
								{alt} ft
							</div>
						</div>
						<div
							className="rounded-lg p-3 col-span-2"
							style={{
								background: "#0F1726",
								border: "1px solid #1B2336",
							}}
						>
							<div className="flex items-center justify-between">
								<div>
									<div
										className="text-[11px]"
										style={{ color: COLORS.muted }}
									>
										Heading
									</div>
									<div className="text-white font-semibold">
										{(
											bearings[Math.min(idx, maxIdx)] ?? 0
										).toFixed(0)}
										°
									</div>
								</div>
								<div
									className="w-16 h-16 rounded-full grid place-items-center"
									style={{
										background: "#0B1629",
										border: "1px solid #1B2336",
									}}
								>
									<div
										className="w-8 h-8 rounded-full"
										style={{ background: COLORS.primary }}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>	
			</section>
		</div>
	);
}
