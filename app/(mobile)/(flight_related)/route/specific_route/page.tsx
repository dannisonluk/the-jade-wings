"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type { FeatureCollection, LineString, Point } from "geojson";
import { airports, type Airport } from "@/db/ts/map/airports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	ChevronDown,
	ChevronUp,
	CircleAlert,
	LoaderCircle,
	MapPinned,
	Pause,
	Play,
} from "lucide-react";
import {
	calculateTrackDistanceKm,
	computeTrackBearing,
	loadTrackCsv,
	type TrackPoint,
} from "@/lib/route/track";

type FileTree = {
	[region: string]: {
		[port: string]: string[]; // filenames under that port (CSV)
	};
};

const HK: [number, number] = [114.1694, 22.3193];

// UI colors
const COLORS = {
	primary: "#2D7FF9",
	primaryDark: "#1B5FD9",
	accent: "#FFD166",
	success: "#2ED573",
	info: "#60A5FA",
	bg: "#0B1220",
	card: "#121A2B",
	muted: "#8FA0B9",
	line: "#006564", // Cathay Pacific dark green (was #7EE1FF)
	trail: "#FFD166",
};

const MAP_VH = 52;
const MAP_MIN = 420;
const FRAME_RATE = 30;

// Parse helpers - FIXED flight number parsing
const parseDateTextFromFilename = (fileName: string) => {
	const match = fileName.match(/-\s*([0-3]?\d)([A-Za-z]{3})(20\d{2})/);
	if (!match) return "--";
	const [, day, mon, year] = match;
	return `${day} ${mon.slice(0, 1).toUpperCase()}${mon
		.slice(1, 3)
		.toLowerCase()} ${year}`;
};

const parseFlightNumberFromFilename = (fileName: string) => {
	// "CX261 - 13Sep2025.csv" -> "CX261"
	const nameWithoutExt = fileName.replace(".csv", "");
	const parts = nameWithoutExt.split(" - ");
	return parts[0]?.trim() || "--";
};

const toPath = (region: string, port: string, fileName: string) =>
	`${region}/${port}/${fileName}`;

// Lookups
const airportByCode = new Map<string, Airport>(
	airports.map((a) => [a.code.toUpperCase(), a])
);

// Static region/port listing
const REGION_PORTS: Record<string, string[]> = {
	CHN: [
		"CAN",
		"CGO",
		"CKG",
		"FOC",
		"HAK",
		"HGH",
		"NGB",
		"NKG",
		"PEK",
		"PVG",
		"SHA",
		"TAO",
		"TFU",
		"URC",
		"WUH",
		"XIY",
		"XMN",
	],
	EUR: [
		"AMS",
		"BCN",
		"BRU",
		"CDG",
		"FCO",
		"FRA",
		"LHR",
		"MAD",
		"MAN",
		"MUC",
		"MXP",
		"ZRH",
	],
	NEA: ["CTS", "FUK", "HND", "ICN", "KHH", "KIX", "NGO", "NRT", "TPE"],
	SAMEA: ["DXB", "JNB", "RUH"],
	SEA: ["BKK", "DPS", "KUL", "SGN", "SIN"],
	SWP: ["AKL", "BNE", "MEL", "PER", "SYD"],
};

// Default files for each region/port (add your actual files here)
const DEFAULT_FILES: Record<string, Record<string, string>> = {
	EUR: {
		AMS: "CX271 - 12Sep2025.csv",
		BCN: "CX321 - 13Sep2025.csv",
		BRU: "CX291 - 12Sep2025.csv",
		CDG: "CX261 - 13Sep2025.csv",
		FCO: "CX293 - 13Sep2025.csv",
		FRA: "CX289 - 11Sep2025.csv",
		LHR: "CX257 - 11Sep2025.csv",
		MAD: "CX315 - 12Sep2025.csv",
		MAN: "CX259 - 13Sep2025.csv",
		MUC: "CX301 - 13Sep2025.csv",
		MXP: "CX233 - 13Sep2025.csv",
		ZRH: "CX383 - 13Sep2025.csv",
	},
	NEA: {
		CTS: "CX580 - 13Sep2025.csv",
		FUK: "CX588 - 13Sep2025.csv",
		HND: "CX548 - 13Sep2025.csv",
		ICN: "CX410 - 13Sep2025.csv",
		KHH: "CX448 - 16Sep2025.csv",
		KIX: "CX506 - 13Sep2025.csv",
		NGO: "CX536 - 13Sep2025.csv",
		NRT: "CX526 - 13Sep2025.csv",
		TPE: "CX402 - 16Sep2025.csv",
	},
	SWP: {
		AKL: "CX113 - 12Sep2025.csv",
		BNE: "CX157 - 12Sep2025.csv",
		MEL: "CX105 - 13Sep2025.csv",
		PER: "CX171 - 12Sep2025.csv",
		SYD: "CX161 - 12Sep2025.csv",
	},
	SEA: {
		BKK: "CX755 - 16Sep2025.csv",
		DPS: "CX785 - 13Sep2025.csv",
		KUL: "CX723 - 15Sep2025.csv",
		SGN: "CX769 - 15Sep2025.csv",
		SIN: "CX739 - 13Sep2025.csv",
	},
	SAMEA: {
		DXB: "CX731 - 12Sep2025.csv",
		JNB: "CX749 - 13Sep2025.csv",
		RUH: "CX647 - 12Sep2025.csv",
	},
	CHN: {
		CAN: "CX982 - 16Sep2025.csv",
		CGO: "CX952 - 16Sep2025.csv",
		CKG: "CX928 - 16Sep2025.csv",
		FOC: "CX990 - 12Sep2025.csv",
		HAK: "CX310 - 16Sep2025.csv",
		HGH: "CX958 - 16Sep2025.csv",
		NGB: "CX956 - 16Sep2025.csv",
		NKG: "CX356 - 16Sep2025.csv",
		PEK: "CX334 - 13Sep2025.csv",
		PVG: "CX360 - 13Sep2025.csv",
		SHA: "CX342 - 13Sep2025.csv",
		TAO: "CX954 - 16Sep2025.csv",
		TFU: "CX986 - 15Sep2025.csv",
		URC: "CX998 - 13Sep2025.csv",
		WUH: "CX938 - 16Sep2025.csv",
		XIY: "CX946 - 16Sep2025.csv",
		XMN: "CX970 - 16Sep2025.csv",
	},
};

// Check file existence
const checkFileExists = async (filePath: string): Promise<boolean> => {
	try {
		const res = await fetch(
			`/api/route/check?file=${encodeURIComponent(filePath)}`
		);
		const data = await res.json();
		return data.exists;
	} catch {
		return false;
	}
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
	const [mapReady, setMapReady] = useState(false);
	const [mapError, setMapError] = useState<string | null>(null);
	const [speed, setSpeed] = useState(1);
	const [follow, setFollow] = useState(false);

	const [showSelectors, setShowSelectors] = useState(true);

	// File selection state
	const [region, setRegion] = useState<string>("EUR");
	const [port, setPort] = useState<string>("CDG");
	const [fileName, setFileName] = useState<string>("CX261 - 13Sep2025.csv");

	// Dynamic file list
	const [tree, setTree] = useState<FileTree | null>(null);
	const [loadingFiles, setLoadingFiles] = useState(false);

	// Build current file path
	const filePath = useMemo(
		() => toPath(region, port, fileName),
		[region, port, fileName]
	);

	// Derive fields for UI
	const dateText = useMemo(
		() => parseDateTextFromFilename(fileName),
		[fileName]
	);
	const destCode = useMemo(() => port.toUpperCase(), [port]);
	const destAirport = useMemo(
		() => airportByCode.get(destCode) || null,
		[destCode]
	);

	const originCode = "HKG";
	const originAirport = airportByCode.get(originCode) || null;
	const flightNumber = useMemo(
		() => parseFlightNumberFromFilename(fileName),
		[fileName]
	);

	// When region changes, update port and file
	useEffect(() => {
		if (!REGION_PORTS[region]) return;

		const availablePorts = REGION_PORTS[region];
		const newPort = availablePorts.includes(port)
			? port
			: availablePorts[0];

		if (newPort !== port) {
			setPort(newPort);
		}

		// Set default file for the new region/port combination
		const defaultFile = DEFAULT_FILES[region]?.[newPort];
		if (defaultFile) {
			setFileName(defaultFile);
		}
	}, [region, port]);

	// When port changes, update file
	useEffect(() => {
		const defaultFile = DEFAULT_FILES[region]?.[port];
		if (defaultFile) {
			setFileName(defaultFile);
		} else if (tree) {
			// If we have tree data, use first available file
			const files = tree[region]?.[port] || [];
			if (files.length > 0) {
				setFileName(files[0]);
			}
		}
	}, [port, region, tree]);

	// Load file list from API (optional)
	useEffect(() => {
		let mounted = true;
		const load = async () => {
			setLoadingFiles(true);
			try {
				const res = await fetch("/api/route/list");
				if (res.ok) {
					const data = (await res.json()) as FileTree;
					if (mounted) setTree(data);
				}
			} catch {
				// ignore; we'll rely on manual filename
			} finally {
				if (mounted) setLoadingFiles(false);
			}
		};
		load();
		return () => {
			mounted = false;
		};
	}, []);

	// SINGLE CSV loading effect with file existence check
	useEffect(() => {
		let mounted = true;
		setError(null);
		setTrack([]);
		setIdx(0);
		setPlaying(false);

		// First check if file exists
		checkFileExists(filePath)
			.then((exists) => {
				if (!mounted) return;

				if (!exists) {
					setError(`File not found: ${filePath}`);
					console.error(`File does not exist: ${filePath}`);
					return;
				}

				// File exists, proceed to load
				const url = `/api/route/flightradar24?file=${encodeURIComponent(
					filePath
				)}`;

				loadTrackCsv(url)
					.then((pts) => {
						if (mounted) {
							setTrack(pts);
							setError(null);
						}
					})
					.catch((e) => {
						if (mounted) {
							setError(`Failed to parse CSV: ${e.message}`);
							console.error(`Failed to parse ${filePath}:`, e);
						}
					});
			})
			.catch((e) => {
				if (mounted) {
					setError(`Error checking file: ${e.message}`);
				}
			});

		return () => {
			mounted = false;
		};
	}, [filePath]);

	// GeoJSONs
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

	const currentBearing = useMemo(() => {
		if (track.length < 2 || idx === 0) return 0;
		const i = Math.min(idx, track.length - 1);
		if (track[i].dir !== undefined) return track[i].dir!;
		if (i > 0) return computeTrackBearing(track[i - 1], track[i]);
		if (i < track.length - 1) return computeTrackBearing(track[i], track[i + 1]);
		return 0;
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

	// Map init
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
		if (!token) {
			console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
			setMapError("Map configuration is unavailable.");
			return;
		}
		setMapError(null);
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
		setMapReady(false);
		setIconLoaded(false);

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
			setMapReady(true);
			["flight-line", "flight-trail", "flight-point"].forEach((id) => {
				map.addSource(id, {
					type: "geojson",
					data: { type: "FeatureCollection", features: [] },
				});
			});

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
						"icon-size": 0.3,
						"icon-allow-overlap": true,
						"icon-rotation-alignment": "viewport",
						"icon-rotate": 0,
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
			setMapReady(false);
			setIconLoaded(false);
			map.remove();
		};
	}, []);

	// Map updates
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !mapReady || !map.isStyleLoaded()) return;

		if (lineFC) {
			(map.getSource("flight-line") as mapboxgl.GeoJSONSource)?.setData(
				lineFC
			);
			if (idx === 0) {
				const bbox = turf.bbox(lineFC.features[0]);
				map.fitBounds(bbox as mapboxgl.LngLatBoundsLike, {
					padding: 48,
					duration: 600,
				});
			}
		}
		if (trailFC) {
			(map.getSource("flight-trail") as mapboxgl.GeoJSONSource)?.setData(
				trailFC
			);
		}
		if (pointFC && iconLoaded) {
			(map.getSource("flight-point") as mapboxgl.GeoJSONSource)?.setData(
				pointFC
			);
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
	}, [lineFC, trailFC, pointFC, iconLoaded, follow, idx, track, mapReady]);

	// Playback
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
			if (animationRef.current)
				cancelAnimationFrame(animationRef.current);
		};
	}, [playing, track.length, speed]);

	// Shortcuts
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

	const handlePlay = useCallback(() => {
		if (idx >= track.length - 1) setIdx(0);
		setPlaying(true);
	}, [idx, track.length]);

	const handlePause = useCallback(() => setPlaying(false), []);

	// Current data
	const currentPoint = track[Math.min(idx, Math.max(0, track.length - 1))];
	const progressPct = track.length
		? (idx / Math.max(1, track.length - 1)) * 100
		: 0;

	// UI helpers
	const regionOptions = Object.keys(REGION_PORTS);
	const portOptions = REGION_PORTS[region] ?? [];

	const filesForPort = useMemo(() => {
		if (!tree) return []; // if no API, leave empty; user can type fileName
		return tree[region]?.[port] || [];
	}, [tree, region, port]);

	return (
		<div
			className="w-full"
			style={{ background: COLORS.bg }}
		>
			<section className="border-b border-[#1B2336] bg-[#0F1726] px-4 py-6">
				<div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row sm:items-end">
					<div>
						<p className="text-xs font-semibold uppercase text-[#7ED7CF]">Historical track</p>
						<h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
							Flight route visualizer
						</h1>
					</div>
					<div className="flex items-center gap-3 text-white">
						<div className="text-right">
							<p className="text-xs text-[#8FA0B9]">{flightNumber} · {dateText}</p>
							<p className="text-lg font-semibold">{originCode} <span className="text-[#8FA0B9]">to</span> {destCode}</p>
						</div>
						<span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#006564]">
							<MapPinned className="h-5 w-5" aria-hidden="true" />
						</span>
					</div>
				</div>
			</section>

			{/* Picker bar */}
			<div
				className="px-4 py-3"
				style={{
					background: COLORS.card,
					borderBottom: "1px solid #1B2336",
				}}
			>
				{/* Selectors row - conditionally shown */}
				{showSelectors && (
					<div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
						<div className="flex min-w-0 flex-col">
							<label
								className="text-xs mb-1"
								style={{ color: COLORS.muted }}
							>
								Region
							</label>
							<select
								value={region}
								onChange={(e) => setRegion(e.target.value)}
								className="h-10 w-full rounded-md border bg-[#0F1726] px-3 text-white"
								style={{ borderColor: "#1B2336" }}
							>
								{regionOptions.map((r) => (
									<option
										key={r}
										value={r}
									>
										{r}
									</option>
								))}
							</select>
						</div>

						<div className="flex min-w-0 flex-col">
							<label
								className="text-xs mb-1"
								style={{ color: COLORS.muted }}
							>
								Port
							</label>
							<select
								value={port}
								onChange={(e) => setPort(e.target.value)}
								className="h-10 w-full rounded-md border bg-[#0F1726] px-3 text-white"
								style={{ borderColor: "#1B2336" }}
							>
								{portOptions.map((p) => (
									<option
										key={p}
										value={p}
									>
										{p}
									</option>
								))}
							</select>
						</div>

						<div className="col-span-2 flex min-w-0 flex-col sm:col-span-1">
							<label
								className="text-xs mb-1"
								style={{ color: COLORS.muted }}
							>
								Flight Number
							</label>
							{filesForPort.length > 0 ? (
								<div className="relative w-full">
									<select
										value={fileName}
										onChange={(e) =>
											setFileName(e.target.value)
										}
										className="h-10 w-full cursor-pointer rounded-md border bg-[#0F1726] px-3 pr-8 text-white opacity-0"
										style={{ borderColor: "#1B2336" }}
									>
										{filesForPort.map((f) => (
											<option
												key={f}
												value={f}
											>
												{parseFlightNumberFromFilename(
													f
												)}
											</option>
										))}
									</select>
									<div
										className="pointer-events-none absolute inset-0 flex h-10 items-center rounded-md border bg-[#0F1726] px-3 text-white"
										style={{ borderColor: "#1B2336" }}
									>
										{parseFlightNumberFromFilename(
											fileName
										)}
										<ChevronDown className="ml-auto h-4 w-4" aria-hidden="true" />
									</div>
								</div>
							) : (
								<input
									value={parseFlightNumberFromFilename(
										fileName
									)}
									onChange={(e) => {
										const dateMatch =
											fileName.match(/-\s*(.+)$/);
										const datePart = dateMatch
											? dateMatch[1]
											: "13Sep2025.csv";
										setFileName(
											`${e.target.value} - ${datePart}`
										);
									}}
								className="h-10 w-full rounded-md border bg-[#0F1726] px-3 text-white"
									style={{
										borderColor: "#1B2336",
								}}
									placeholder="e.g. CX261"
								/>
							)}
						</div>

						{loadingFiles && (
					<span
								className="col-span-2 inline-flex items-center gap-2 text-xs sm:col-span-3"
								style={{ color: COLORS.muted }}
							>
								<LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Loading tracks
							</span>
						)}
					</div>
				)}

				{/* Controls row - always shown */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Toggle button */}
					<button
						onClick={() => setShowSelectors(!showSelectors)}
						className="h-9 w-9 rounded-md text-white/90 border transition-all hover:bg-[#1B2336] flex items-center justify-center"
						style={{
							background: showSelectors
								? "#0F1726"
								: COLORS.accent,
							borderColor: showSelectors
								? COLORS.accent
								: "#1B2336",
						}}
						title={
							showSelectors ? "Hide selectors" : "Show selectors"
						}
					>
						{showSelectors ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
					</button>

					{/* NO flight number display here - removed completely */}

					{/* Spacer - only when selectors are shown */}
					{showSelectors && <div className="flex-1" />}

					{/* Playback controls */}
					<button
						onClick={playing ? handlePause : handlePlay}
						disabled={track.length === 0}
						className="flex h-9 min-w-24 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
						style={{ background: COLORS.primary }}
					>
						{playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
						{playing ? "Pause" : "Play"}
					</button>

					<label
						className="flex items-center gap-2 text-sm"
						style={{ color: COLORS.muted }}
					>
						<input
							type="checkbox"
							checked={follow}
							onChange={(e) => setFollow(e.target.checked)}
							className="rounded"
						/>
						Follow
					</label>

					{/* Speed controls */}
					<div className="flex items-center gap-1">
						{[1, 2, 4].map((s) => (
							<button
								key={s}
								onClick={() => setSpeed(s)}
								className="h-9 w-12 rounded-md text-sm font-medium border transition-all hover:opacity-90"
								style={{
									background:
										speed === s ? COLORS.accent : "#0F1726",
									color: speed === s ? "#1A1F2B" : "#E6F0FF",
									borderColor:
										speed === s ? COLORS.accent : "#1B2336",
								}}
							>
								{s}x
							</button>
						))}
					</div>
				</div>

				{/* Progress bar - always shown */}
				<div className="mt-3">
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
				{mapError && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B1220] px-6 text-center text-sm text-white">
						<CircleAlert className="mr-2 h-5 w-5 text-amber-300" aria-hidden="true" />
						{mapError}
					</div>
				)}
				<div
					className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-md px-3 py-1.5 text-xs font-medium"
					style={{
						background: "#1E2B45",
						color: "#E6F0FF",
						border: "1px solid #243352",
					}}
				>
					{error
						? `Error: ${error}`
						: track.length
						? `${track[Math.min(idx, track.length - 1)].lat.toFixed(
								4
						  )}, ${track[
								Math.min(idx, track.length - 1)
						  ].lon.toFixed(4)} • hdg ${currentBearing.toFixed(
								0
						  )}° • spd ${
								track[Math.min(idx, track.length - 1)].spd ?? 0
						  } kt • alt ${
								track[Math.min(idx, track.length - 1)].alt ?? 0
						  } ft`
						: "Loading..."}
				</div>
			</div>

			{/* Top info: date and simple route
			<section
				className="px-4 py-3"
				style={{ background: COLORS.bg }}
			>
				<div className="text-white/95 text-sm">
					Historical Flight: {dateText}
				</div>
				<div className="mt-1 grid grid-cols-2 gap-x-6 text-sm text-white/90">
					<div>Origin: {originCode}</div>
					<div>Destination: {destCode}</div>
				</div>
			</section> */}

			{/* Bottom two cards: Flight Records (left) and Flight Details (right) */}
			<section
				className="px-4 pt-4 pb-4"
				style={{ background: COLORS.bg }}
			>
				<Tabs
					defaultValue="records"
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2 bg-[#0F1726]">
						<TabsTrigger
							value="records"
							className="data-[state=active]:bg-[#1B2336] data-[state=active]:!text-white text-white/70"
						>
							Flight Records
						</TabsTrigger>
						<TabsTrigger
							value="details"
							className="data-[state=active]:bg-[#1B2336] data-[state=active]:!text-white text-white/70"
						>
							Flight Details
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="records"
						className="mt-1"
					>
						<div
							className="rounded-xl p-4 border"
							style={{
								background: COLORS.card,
								borderColor: "#1B2336",
							}}
						>
							<div className="grid grid-cols-2 gap-3">
								{/* Flight Number */}
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
										Flight Number
									</div>
									<div className="text-white font-semibold text-lg">
										{flightNumber || "--"}
									</div>
								</div>

								{/* Date of Operation */}
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
										Date of Operation
									</div>
									<div className="text-white font-semibold">
										{dateText}
									</div>
								</div>

								{/* Origin */}
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
										Origin
									</div>
									<div className="text-white font-semibold">
										{originCode}
									</div>
									<div className="text-white/60 text-xs mt-0.5">
										{originAirport
											? originAirport.name
											: ""}
									</div>
								</div>

								{/* Destination */}
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
										Destination
									</div>
									<div className="text-white font-semibold">
										{destCode}
									</div>
									<div className="text-white/60 text-xs mt-0.5">
										{destAirport
											? `${destAirport.city}, ${destAirport.country}`
											: ""}
									</div>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent
						value="details"
						className="mt-4"
					>
						<div
							className="rounded-xl p-4 border"
							style={{
								background: COLORS.card,
								borderColor: "#1B2336",
							}}
						>
							<div className="grid grid-cols-2 gap-3">
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
									<div className="text-white font-semibold text-lg">
										{calculateTrackDistanceKm(track).toFixed(0)}{" "}
										km
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
									<div className="text-white font-semibold text-lg">
										{progressPct.toFixed(0)}%
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
									<div className="text-white font-semibold text-lg">
										{currentPoint?.spd ?? 0} kt
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
									<div className="text-white font-semibold text-lg">
										{currentPoint?.alt ?? 0} ft
									</div>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</section>
		</div>
	);
}
