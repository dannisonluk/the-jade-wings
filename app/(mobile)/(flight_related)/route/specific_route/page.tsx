"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type { FeatureCollection, LineString, Point } from "geojson";
import Papa from "papaparse";

type TrackPoint = {
	lat: number;
	lon: number;
	alt?: number;
	spd?: number;
	dir?: number;
	t?: number;
};

const HK: [number, number] = [114.1694, 22.3193];
const DEFAULT_FILE = "EUR/CDG/CX261 - 13Sep2025.csv";

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

const MAP_VH = 52;
const MAP_MIN = 420;
const FRAME_RATE = 30; // FPS for smoother animation

// Utilities
const km = (nm: number) => nm * 1.852;

const calcTotalDistanceKm = (track: TrackPoint[]) => {
	if (track.length < 2) return 0;
	const line = turf.lineString(track.map((p) => [p.lon, p.lat]));
	return km(turf.length(line, { units: "nauticalmiles" }));
};

const computeBearing = (from: TrackPoint, to: TrackPoint): number => {
	const bearing = turf.bearing([from.lon, from.lat], [to.lon, to.lat]);
	return ((bearing % 360) + 360) % 360;
};

const parseDestAndDateFromFile = (filePath: string) => {
	const parts = filePath.split("/");
	const dest = (parts[1] || "").toUpperCase() || "--";
	const fileName = parts[parts.length - 1] || "";
	const match = fileName.match(/-\s*([0-3]?\d)([A-Za-z]{3})(20\d{2})/);
	if (!match) return { dest, dateText: "--" };
	const [, day, mon, year] = match;
	const dateText = `${day} ${mon.slice(0, 1).toUpperCase()}${mon
		.slice(1, 3)
		.toLowerCase()} ${year}`;
	return { dest, dateText };
};

const parseCSV = async (url: string): Promise<TrackPoint[]> => {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to load CSV (${res.status})`);
	const csvText = await res.text();

	const parsed = Papa.parse<Record<string, string>>(csvText, {
		header: true,
		dynamicTyping: false,
		skipEmptyLines: true,
	});

	const pts: TrackPoint[] = [];
	for (const row of parsed.data) {
		if (!row) continue;

		const posRaw =
			row["Position"] ??
			row["position"] ??
			row[" POS"] ??
			row["pos"] ??
			row["Position "];
		if (!posRaw) continue;

		const trimmed = String(posRaw).trim().replace(/^"|"$/g, "");
		if (!trimmed.includes(",")) continue;

		const [latStr, lonStr] = trimmed.split(/\s*,\s*/);
		const lat = Number(latStr);
		const lon = Number(lonStr);
		if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

		const tp: TrackPoint = { lat, lon };

		// Parse optional fields
		const parseNumber = (key: string) => {
			const raw = row[key] ?? row[key.toLowerCase()];
			if (raw !== undefined && raw !== "") {
				const v = Number(String(raw).replace(/,/g, ""));
				return Number.isFinite(v) ? v : undefined;
			}
			return undefined;
		};

		tp.alt = parseNumber("Altitude");
		tp.spd = parseNumber("Speed");
		tp.dir = parseNumber("Direction");
		tp.t = parseNumber("Timestamp") ?? parseNumber("UTC");

		pts.push(tp);
	}

	// Remove duplicates
	const cleaned = pts.filter(
		(p, i, arr) =>
			i === 0 || p.lat !== arr[i - 1].lat || p.lon !== arr[i - 1].lon
	);

	if (cleaned.length < 2) throw new Error("Not enough points in CSV");

	return cleaned;
};

export default function FlightPlayback() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const animationRef = useRef<number>(0);

	const [track, setTrack] = useState<TrackPoint[]>([]);
	const [idx, setIdx] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [playing, setPlaying] = useState(false);
	const [iconLoaded, setIconLoaded] = useState(false);
	const [speed, setSpeed] = useState(1);
	const [follow, setFollow] = useState(false);

	const { dest, dateText } = parseDestAndDateFromFile(DEFAULT_FILE);

	// Calculate current bearing based on direction of travel
	const currentBearing = useMemo(() => {
		if (track.length < 2 || idx === 0) return 0;
		const i = Math.min(idx, track.length - 1);

		// Use provided direction if available
		if (track[i].dir !== undefined) {
			return track[i].dir!;
		}

		// Calculate bearing from previous point to current point
		if (i > 0) {
			return computeBearing(track[i - 1], track[i]);
		}

		// Calculate bearing from current point to next point
		if (i < track.length - 1) {
			return computeBearing(track[i], track[i + 1]);
		}

		return 0;
	}, [track, idx]);

	// Load CSV
	useEffect(() => {
		let mounted = true;
		setError(null);
		setTrack([]);
		setIdx(0);

		const url = `/api/route/flightradar24?file=${encodeURIComponent(
			DEFAULT_FILE
		)}`;
		parseCSV(url)
			.then((pts) => {
				if (mounted) setTrack(pts);
			})
			.catch((e) => {
				if (mounted) setError(e.message);
			});

		return () => {
			mounted = false;
		};
	}, []);

	// GeoJSON data
	const lineFC = useMemo<FeatureCollection<LineString> | null>(() => {
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

	const trailFC = useMemo<FeatureCollection<LineString> | null>(() => {
		if (track.length < 2 || idx === 0) return null;
		const i = Math.min(idx, track.length - 1);
		return {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					properties: {},
					geometry: {
						type: "LineString",
						coordinates: track
							.slice(0, i + 1)
							.map((p) => [p.lon, p.lat]),
					},
				},
			],
		};
	}, [track, idx]);

	const pointFC = useMemo<FeatureCollection<Point> | null>(() => {
		if (!track.length) return null;
		const i = Math.min(idx, track.length - 1);
		const p = track[i];
		return {
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					properties: {
						bearing: currentBearing,
						speed: p.spd ?? 0,
						altitude: p.alt ?? 0,
					},
					geometry: { type: "Point", coordinates: [p.lon, p.lat] },
				},
			],
		};
	}, [track, idx, currentBearing]);

	// Initialize map
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

		// Ensure proper sizing
		setTimeout(() => map.resize(), 0);
		requestAnimationFrame(() => map.resize());

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
			// Add sources
			["flight-line", "flight-trail", "flight-point"].forEach((id) => {
				map.addSource(id, {
					type: "geojson",
					data: { type: "FeatureCollection", features: [] },
				});
			});

			// Base route layer
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

			// Glow effect
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

			// Load and add airplane icon
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
						// "icon-image": "plane-icon",
						// "icon-size": 0.35,
						// "icon-allow-overlap": true,
						// "icon-rotation-alignment": "map", // Rotate with map
						// "icon-rotate": ["get", "bearing"], // Use bearing from properties
						"icon-image": "plane-icon",
						"icon-size": 0.3, // smaller; try 0.2–0.4
						"icon-allow-overlap": true,
						"icon-rotation-alignment": "viewport", // do NOT rotate with map
						"icon-rotate": 0, // force no rotation
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

	// Update map data
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !map.isStyleLoaded()) return;

		// Update route line
		if (lineFC) {
			(map.getSource("flight-line") as mapboxgl.GeoJSONSource)?.setData(
				lineFC
			);

			// Fit bounds on initial load
			if (idx === 0) {
				const bbox = turf.bbox(lineFC.features[0]);
				map.fitBounds(bbox as mapboxgl.LngLatBoundsLike, {
					padding: 48,
					duration: 600,
				});
			}
		}

		// Update trail
		if (trailFC) {
			(map.getSource("flight-trail") as mapboxgl.GeoJSONSource)?.setData(
				trailFC
			);
		}

		// Update plane position
		if (pointFC && iconLoaded) {
			(map.getSource("flight-point") as mapboxgl.GeoJSONSource)?.setData(
				pointFC
			);

			// Follow mode
			if (follow && track.length > 0) {
				const i = Math.min(idx, track.length - 1);
				const p = track[i];
				map.easeTo({
					center: [p.lon, p.lat],
					duration: 450,
					easing: (t) => 1 - Math.pow(1 - t, 3),
				});
			}
		}
	}, [lineFC, trailFC, pointFC, iconLoaded, follow, idx, track]);

	// Playback animation
	useEffect(() => {
		if (!playing || track.length === 0) return;

		const maxIdx = track.length - 1;
		let lastTime = performance.now();

		const animate = (currentTime: number) => {
			const deltaTime = currentTime - lastTime;
			const frameInterval = 1000 / (FRAME_RATE * speed);

			if (deltaTime >= frameInterval) {
				setIdx((prevIdx) => {
					if (prevIdx >= maxIdx) {
						setPlaying(false);
						return prevIdx;
					}
					return prevIdx + 1;
				});
				lastTime = currentTime;
			}

			animationRef.current = requestAnimationFrame(animate);
		};

		animationRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [playing, track.length, speed]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			const maxIdx = Math.max(0, track.length - 1);
			switch (e.key) {
				case " ":
				case "k":
					e.preventDefault();
					setPlaying((prev) => !prev);
					break;
				case "ArrowRight":
					setIdx((i) => Math.min(i + 5, maxIdx));
					break;
				case "ArrowLeft":
					setIdx((i) => Math.max(i - 5, 0));
					break;
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [track.length]);

	// Handle play/pause button clicks
	const handlePlay = useCallback(() => {
		if (idx >= track.length - 1) {
			setIdx(0); // Reset if at end
		}
		setPlaying(true);
	}, [idx, track.length]);

	const handlePause = useCallback(() => {
		setPlaying(false);
	}, []);

	// Current data
	const currentPoint = track[Math.min(idx, Math.max(0, track.length - 1))];
	const progressPct = track.length
		? (idx / Math.max(1, track.length - 1)) * 100
		: 0;

	return (
		<div
			className="w-full"
			style={{ background: COLORS.bg }}
		>
			{/* Controls */}
			<div
				className="px-4 pt-3 pb-2"
				style={{
					background: COLORS.card,
					borderBottom: "1px solid #1B2336",
				}}
			>
				<div className="flex items-center gap-3">
					<button
						onClick={handlePlay}
						disabled={playing}
						className="h-9 px-3 rounded-md text-white text-sm font-medium transition-opacity disabled:opacity-50"
						style={{ background: COLORS.primary }}
					>
						Play
					</button>
					<button
						onClick={handlePause}
						disabled={!playing}
						className="h-9 px-3 rounded-md text-white/90 text-sm border transition-opacity disabled:opacity-50"
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
						{[1, 2, 4].map((s) => (
							<button
								key={s}
								onClick={() => setSpeed(s)}
								className="h-9 px-2.5 rounded-md text-xs font-medium border transition-colors"
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

				{/* Progress bar */}
				<div className="mt-2">
					<input
						type="range"
						min={0}
						max={Math.max(0, track.length - 1)}
						value={idx}
						onChange={(e) => setIdx(Number(e.target.value))}
						className="w-full h-2"
						style={{ accentColor: COLORS.accent }}
					/>
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
					className="absolute inset-0 overflow-hidden h-full"
				/>

				{/* Status pill */}
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
						: currentPoint
						? `${currentPoint.lat.toFixed(
								4
						  )}, ${currentPoint.lon.toFixed(
								4
						  )} • hdg ${currentBearing.toFixed(0)}° • spd ${
								currentPoint.spd ?? 0
						  } kt • alt ${currentPoint.alt ?? 0} ft`
						: "Loading..."}
				</div>
			</div>

			{/* Flight info */}
			<section
				className="px-4 py-3"
				style={{ background: COLORS.bg }}
			>
				<div className="text-white/95 text-sm">
					Historical Flight: {dateText}
				</div>
				<div className="mt-1 grid grid-cols-2 gap-x-6 text-sm text-white/90">
					<div>Origin: HKG</div>
					<div>Destination: {dest}</div>
				</div>
			</section>

			{/* Flight details */}
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
						{[
							{
								label: "Distance",
								value: `${calcTotalDistanceKm(track).toFixed(
									0
								)} km`,
							},
							{
								label: "Progress",
								value: `${progressPct.toFixed(0)}%`,
							},
							{
								label: "Groundspeed",
								value: `${currentPoint?.spd ?? 0} kt`,
							},
							{
								label: "Altitude",
								value: `${currentPoint?.alt ?? 0} ft`,
							},
						].map(({ label, value }) => (
							<div
								key={label}
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
									{label}
								</div>
								<div className="text-white font-semibold">
									{value}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
