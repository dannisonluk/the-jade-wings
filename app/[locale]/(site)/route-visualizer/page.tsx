"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type { FeatureCollection, LineString, Point } from "geojson";
import { airports, type Airport } from "@/data/reference/airports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	ChevronDown,
	ChevronUp,
	CircleAlert,
	LoaderCircle,
	MapPinned,
	Pause,
	Play,
	Gauge,
	Compass,
	Mountain,
	Globe,
} from "lucide-react";
import {
	calculateTrackDistanceKm,
	computeTrackBearing,
	loadTrackCsv,
	type TrackPoint,
} from "@/features/routes/track";

type FileTree = {
	[region: string]: {
		[port: string]: string[]; // filenames under that port (CSV)
	};
};

const HK: [number, number] = [114.1694, 22.3193];

// UI colors
const COLORS = {
	primary: "#10B981", // Emerald 500
	accent: "#F59E0B", // Amber 500
	bg: "#0B0F17",
	card: "#131B2E",
	muted: "#94A3B8",
	line: "#006564", // Cathay Pacific dark green
	trail: "#F59E0B",
};

const MAP_VH = 52;
const MAP_MIN = 420;
const FRAME_RATE = 30;

// Parse helpers
const parseDateTextFromFilename = (fileName: string) => {
	const match = fileName.match(/-\s*([0-3]?\d)([A-Za-z]{3})(20\d{2})/);
	if (!match) return "--";
	const [, day, mon, year] = match;
	return `${day} ${mon.slice(0, 1).toUpperCase()}${mon
		.slice(1, 3)
		.toLowerCase()} ${year}`;
};

const parseFlightNumberFromFilename = (fileName: string) => {
	const nameWithoutExt = fileName.replace(".csv", "");
	const parts = nameWithoutExt.split(" - ");
	return parts[0]?.trim() || "--";
};

const toPath = (region: string, port: string, fileName: string) =>
	`${region}/${port}/${fileName}`;

// Lookups
const airportByCode = new Map<string, Airport>(
	airports.map((a) => [a.code.toUpperCase(), a]),
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

const checkFileExists = async (filePath: string): Promise<boolean> => {
	try {
		const res = await fetch(
			`/api/route/check?file=${encodeURIComponent(filePath)}`,
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
		[region, port, fileName],
	);

	// Derive fields for UI
	const dateText = useMemo(
		() => parseDateTextFromFilename(fileName),
		[fileName],
	);
	const destCode = useMemo(() => port.toUpperCase(), [port]);
	const destAirport = useMemo(
		() => airportByCode.get(destCode) || null,
		[destCode],
	);

	const originCode = "HKG";
	const originAirport = airportByCode.get(originCode) || null;
	const flightNumber = useMemo(
		() => parseFlightNumberFromFilename(fileName),
		[fileName],
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
			const files = tree[region]?.[port] || [];
			if (files.length > 0) {
				setFileName(files[0]);
			}
		}
	}, [port, region, tree]);

	// Load file list from API
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
				// Fallback silently
			} finally {
				if (mounted) setLoadingFiles(false);
			}
		};
		load();
		return () => {
			mounted = false;
		};
	}, []);

	// CSV loading effect
	useEffect(() => {
		let mounted = true;
		setError(null);
		setTrack([]);
		setIdx(0);
		setPlaying(false);

		checkFileExists(filePath)
			.then((exists) => {
				if (!mounted) return;

				if (!exists) {
					setError(`File not found: ${filePath}`);
					return;
				}

				const url = `/api/route/flightradar24?file=${encodeURIComponent(
					filePath,
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
		if (i < track.length - 1)
			return computeTrackBearing(track[i], track[i + 1]);
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
				lineFC,
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
				trailFC,
			);
		}
		if (pointFC && iconLoaded) {
			(map.getSource("flight-point") as mapboxgl.GeoJSONSource)?.setData(
				pointFC,
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

	// Playback animation loop
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

	// Keyboard Shortcuts
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

	const currentPoint = track[Math.min(idx, Math.max(0, track.length - 1))];
	const progressPct = track.length
		? (idx / Math.max(1, track.length - 1)) * 100
		: 0;

	const regionOptions = Object.keys(REGION_PORTS);
	const portOptions = REGION_PORTS[region] ?? [];

	const filesForPort = useMemo(() => {
		if (!tree) return [];
		return tree[region]?.[port] || [];
	}, [tree, region, port]);

	return (
		<div className="w-full bg-[#0B0F17] text-slate-100 font-sans shadow-2xl">
			{/* Top Header - Left Aligned Route Info */}
			<header className="border-b border-slate-800/80 bg-[#0F1726]/90 px-4 py-3.5">
				<div className="mx-auto flex max-w-7xl flex-col gap-2.5">
					<div>
						<div className="flex items-center gap-2">
							<span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
							<p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
								Historical Track
							</p>
						</div>
						<h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
							Flight Route Visualizer
						</h1>
					</div>

					{/* Moved Route Info Flush Left */}
					<div className="flex items-center gap-3 text-white">
						<div className="text-left">
							<p className="text-xs font-medium text-slate-400">
								{flightNumber}{" "}
								<span className="mx-1 text-slate-600">•</span>{" "}
								{dateText}
							</p>
							<p className="text-base font-bold tracking-wide text-white">
								{originCode}{" "}
								<span className="text-xs text-emerald-400 font-normal px-1">
									➔
								</span>{" "}
								{destCode}
							</p>
						</div>
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
							<MapPinned
								className="h-4.5 w-4.5"
								aria-hidden="true"
							/>
						</div>
					</div>
				</div>
			</header>

			{/* Main Interactive Controls */}
			<div className="border-b border-slate-800/80 bg-[#0B0F17] px-4 py-3">
				<div className="mx-auto max-w-7xl flex flex-col gap-3">
					{/* Selectors Row */}
					{showSelectors && (
						<div className="grid grid-cols-2 gap-3">
							{/* Region */}
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-slate-400">
									Region
								</label>
								<div className="relative">
									<select
										value={region}
										onChange={(e) =>
											setRegion(e.target.value)
										}
										className="h-10 w-full appearance-none rounded-lg border border-slate-700/60 bg-[#0F1726] px-3 pr-8 text-sm font-medium text-slate-200 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
									<ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
								</div>
							</div>

							{/* Port */}
							<div className="flex flex-col gap-1">
								<label className="text-xs font-medium text-slate-400">
									Port
								</label>
								<div className="relative">
									<select
										value={port}
										onChange={(e) =>
											setPort(e.target.value)
										}
										className="h-10 w-full appearance-none rounded-lg border border-slate-700/60 bg-[#0F1726] px-3 pr-8 text-sm font-medium text-slate-200 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
									<ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
								</div>
							</div>

							{/* Flight Number Select/Input */}
							<div className="col-span-2 flex flex-col gap-1">
								<label className="text-xs font-medium text-slate-400">
									Flight Number
								</label>
								{filesForPort.length > 0 ? (
									<div className="relative">
										<select
											value={fileName}
											onChange={(e) =>
												setFileName(e.target.value)
											}
											className="h-10 w-full appearance-none rounded-lg border border-slate-700/60 bg-[#0F1726] px-3 pr-8 text-sm font-medium text-slate-200 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
										>
											{filesForPort.map((f) => (
												<option
													key={f}
													value={f}
												>
													{parseFlightNumberFromFilename(
														f,
													)}
												</option>
											))}
										</select>
										<ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
									</div>
								) : (
									<input
										value={parseFlightNumberFromFilename(
											fileName,
										)}
										onChange={(e) => {
											const dateMatch =
												fileName.match(/-\s*(.+)$/);
											const datePart = dateMatch
												? dateMatch[1]
												: "13Sep2025.csv";
											setFileName(
												`${e.target.value} - ${datePart}`,
											);
										}}
										className="h-10 w-full rounded-lg border border-slate-700/60 bg-[#0F1726] px-3 text-sm font-medium text-slate-200 transition-all placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
										placeholder="e.g. CX261"
									/>
								)}
							</div>

							{loadingFiles && (
								<div className="col-span-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
									<LoaderCircle className="h-3.5 w-3.5 animate-spin" />
									<span>Loading flight tracks...</span>
								</div>
							)}
						</div>
					)}

					{/* ALL CONTROLS IN ONE SINGLE ROW WITH MATCHING HEIGHTS */}
					<div className="flex flex-nowrap items-center gap-2 overflow-x-auto py-0.5">
						{/* Toggle Drawer */}
						<button
							onClick={() => setShowSelectors(!showSelectors)}
							className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700/60 bg-[#0F1726] text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
							title={
								showSelectors ? "Hide options" : "Show options"
							}
						>
							{showSelectors ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</button>

						{/* Play/Pause Button (Height matched to h-8) */}
						<button
							onClick={playing ? handlePause : handlePlay}
							disabled={track.length === 0}
							className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all hover:bg-emerald-400 disabled:opacity-40 shadow-sm"
						>
							{playing ? (
								<Pause
									className="h-3.5 w-3.5 fill-current"
									aria-hidden="true"
								/>
							) : (
								<Play
									className="h-3.5 w-3.5 fill-current"
									aria-hidden="true"
								/>
							)}
							{playing ? "PAUSE" : "PLAY"}
						</button>

						{/* Speed Buttons (Height h-8) */}
						<div className="flex h-8 shrink-0 items-center rounded-lg bg-[#0F1726] p-0.5 border border-slate-800">
							{[1, 2, 4].map((s) => (
								<button
									key={s}
									onClick={() => setSpeed(s)}
									className={`h-7 px-2.5 text-xs font-bold rounded-md transition-all ${
										speed === s
											? "bg-emerald-500 text-slate-950 shadow-sm"
											: "text-slate-400 hover:text-white"
									}`}
								>
									{s}x
								</button>
							))}
						</div>

						{/* Follow Checkbox (Shortened label 'Follow') */}
						<label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all px-1">
							<input
								type="checkbox"
								checked={follow}
								onChange={(e) => setFollow(e.target.checked)}
								className="h-4 w-4 rounded border-slate-600 bg-[#0F1726] text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
							/>
							<span className="whitespace-nowrap">Follow</span>
						</label>
					</div>

					{/* Timeline Progress Slider */}
					<div className="pt-1 px-0.5">
						<input
							type="range"
							min={0}
							max={Math.max(0, track.length - 1)}
							value={idx}
							onChange={(e) => setIdx(Number(e.target.value))}
							className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500 focus:outline-none"
						/>
					</div>
				</div>
			</div>

			{/* Map Display Viewport */}
			<div
				className="relative w-full border-b border-slate-800/80"
				style={{
					height: `min(${MAP_VH}vh, 700px)`,
					minHeight: MAP_MIN,
				}}
			>
				<div
					ref={containerRef}
					className="absolute inset-0 h-full w-full overflow-hidden"
				/>

				{mapError && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0F17]/90 px-6 text-center text-sm text-white backdrop-blur-sm">
						<CircleAlert
							className="mr-2 h-5 w-5 text-amber-400"
							aria-hidden="true"
						/>
						{mapError}
					</div>
				)}

				{/* Floating Telemetry HUD - Coordinates set to max 2dp */}
				<div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800/80 bg-[#0F1726]/80 p-2 px-3.5 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-xl">
					{error ? (
						<span className="text-rose-400">Error: {error}</span>
					) : track.length ? (
						<>
							<div className="flex items-center gap-1.5 pr-2 border-r border-slate-800 text-slate-400">
								<Globe className="h-3.5 w-3.5 text-emerald-400" />
								<span>
									{track[
										Math.min(idx, track.length - 1)
									].lat.toFixed(2)}
									,{" "}
									{track[
										Math.min(idx, track.length - 1)
									].lon.toFixed(2)}
								</span>
							</div>
							<div className="flex items-center gap-1.5 px-2 border-r border-slate-800 text-slate-300">
								<Compass className="h-3.5 w-3.5 text-amber-400" />
								<span>{currentBearing.toFixed(0)}°</span>
							</div>
							<div className="flex items-center gap-1.5 px-2 border-r border-slate-800 text-slate-300">
								<Gauge className="h-3.5 w-3.5 text-cyan-400" />
								<span>
									{track[Math.min(idx, track.length - 1)]
										.spd ?? 0}{" "}
									kt
								</span>
							</div>
							<div className="flex items-center gap-1.5 pl-2 text-slate-300">
								<Mountain className="h-3.5 w-3.5 text-indigo-400" />
								<span>
									{track[Math.min(idx, track.length - 1)]
										.alt ?? 0}{" "}
									ft
								</span>
							</div>
						</>
					) : (
						<span className="flex items-center gap-2 text-slate-400">
							<LoaderCircle className="h-3.5 w-3.5 animate-spin text-emerald-400" />
							Initializing map telemetry...
						</span>
					)}
				</div>
			</div>

			{/* Flight Detail Panels & Tabs */}
			<section className="mx-auto max-w-7xl px-4 py-6">
				<Tabs
					defaultValue="records"
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2 rounded-xl bg-[#0F1726] p-1 border border-slate-800 h-auto">
						<TabsTrigger
							value="records"
							className="rounded-lg py-2.5 text-xs font-bold text-slate-400 transition-all data-[state=active]:!bg-[#1B2336] data-[state=active]:!text-emerald-400 data-[state=active]:shadow-sm"
						>
							Flight Overview
						</TabsTrigger>
						<TabsTrigger
							value="details"
							className="rounded-lg py-2.5 text-xs font-bold text-slate-400 transition-all data-[state=active]:!bg-[#1B2336] data-[state=active]:!text-emerald-400 data-[state=active]:shadow-sm"
						>
							Telemetry Stats
						</TabsTrigger>
					</TabsList>

					<TabsContent
						value="records"
						className="mt-4"
					>
						<div className="rounded-2xl border border-slate-800/80 bg-[#0F1726]/40 p-5 backdrop-blur-sm">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-4">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
										Flight Number
									</p>
									<p className="mt-1 text-xl font-bold text-white">
										{flightNumber || "--"}
									</p>
								</div>

								<div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-4">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
										Date of Operation
									</p>
									<p className="mt-1 text-base font-semibold text-white">
										{dateText}
									</p>
								</div>

								<div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-4">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
										Origin
									</p>
									<p className="mt-1 text-base font-semibold text-white">
										{originCode}
									</p>
									<p className="text-xs text-slate-500 truncate mt-0.5">
										{originAirport
											? originAirport.name
											: ""}
									</p>
								</div>

								<div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-4">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
										Destination
									</p>
									<p className="mt-1 text-base font-semibold text-white">
										{destCode}
									</p>
									<p className="text-xs text-slate-500 truncate mt-0.5">
										{destAirport
											? `${destAirport.city}, ${destAirport.country}`
											: ""}
									</p>
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent
						value="details"
						className="mt-4"
					>
						<div className="rounded-2xl border border-slate-800/80 bg-[#0F1726]/40 p-5 backdrop-blur-sm">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-4">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
										Total Distance
									</p>
									<p className="mt-1 text-xl font-bold text-white">
										{calculateTrackDistanceKm(
											track,
										).toFixed(0)}{" "}
										<span className="text-sm font-normal text-slate-400">
											km
										</span>
									</p>
								</div>

								<div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-4">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
										Route Progress
									</p>
									<p className="mt-1 text-xl font-bold text-emerald-400">
										{progressPct.toFixed(0)}%
									</p>
								</div>

								<div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-4">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
										Groundspeed
									</p>
									<p className="mt-1 text-xl font-bold text-white">
										{currentPoint?.spd ?? 0}{" "}
										<span className="text-sm font-normal text-slate-400">
											kt
										</span>
									</p>
								</div>

								<div className="rounded-xl border border-slate-800/80 bg-[#0B0F17] p-4">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
										Altitude
									</p>
									<p className="mt-1 text-xl font-bold text-white">
										{currentPoint?.alt ?? 0}{" "}
										<span className="text-sm font-normal text-slate-400">
											ft
										</span>
									</p>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</section>
		</div>
	);
}
