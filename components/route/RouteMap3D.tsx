"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import { greatCircle } from "@turf/great-circle";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";

import { airports } from "@/db/ts/map/airports";
import { routes } from "@/db/ts/map/routes";

type LngLat = [number, number];
const HK: LngLat = [114.1694, 22.3193];

export default function RouteMap3D() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);

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
			center: HK,
			zoom: 3.5,
			projection: "globe",
			pitch: 0,
			bearing: -15,
			antialias: true,
		});
		mapRef.current = map;

		const setNeutralCamera = () => {
			map.easeTo({
				center: HK,
				zoom: 3.5,
				pitch: 0,
				bearing: -15,
				duration: 0,
				padding: { top: 0, right: 0, bottom: 0, left: 0 },
				offset: [0, 0],
			});
		};

		map.on("style.load", () => {
			setNeutralCamera();
			map.setFog({
				color: "hsl(200, 10%, 85%)",
				"high-color": "hsl(200, 10%, 100%)",
				"horizon-blend": 0.05,
				"space-color": "#000000",
				"star-intensity": 0.0,
			});
		});

		map.on("load", () => {
			// Helper to find airport by code
			const getAirport = (code: string) =>
				airports.find((a) => a.code === code);

			// Filter out any self routes
			const filteredRoutes = routes.filter(([src, dst]) => src !== dst);

			// Build a LineString feature per route using great circle
			const features: Feature<LineString>[] = [];

			for (const [srcCode, dstCode] of filteredRoutes) {
				const src = getAirport(srcCode);
				const dst = getAirport(dstCode);
				if (!src || !dst) continue;

				try {
					// Create start and end points
					const start = turf.point([src.lon, src.lat]);
					const end = turf.point([dst.lon, dst.lat]);

					// Generate great circle route (handles antimeridian automatically)
					const gcRoute = greatCircle(start, end, { npoints: 100 });

					features.push({
						type: "Feature",
						properties: { src: srcCode, dst: dstCode },
						geometry: gcRoute.geometry as LineString,
					});
				} catch (error) {
					console.warn(
						`Failed to create route ${srcCode}-${dstCode}:`,
						error
					);
				}
			}

			const routesFC: FeatureCollection<LineString> = {
				type: "FeatureCollection",
				features,
			};

			// HKG point
			const hkg = airports.find((a) => a.code === "HKG");
			if (!hkg) {
				console.error("HKG not found in airports");
				return;
			}

			const hkgPoint: FeatureCollection<Point> = {
				type: "FeatureCollection",
				features: [
					{
						type: "Feature",
						properties: { code: "HKG", name: "Hong Kong Intl" },
						geometry: {
							type: "Point",
							coordinates: [hkg.lon, hkg.lat],
						},
					},
				],
			};

			// Add sources
			map.addSource("routes", { type: "geojson", data: routesFC });
			map.addSource("hkg", { type: "geojson", data: hkgPoint });

			// Add layers
			map.addLayer({
				id: "routes",
				source: "routes",
				type: "line",
				paint: {
					"line-width": 1.5,
					"line-color": "#00BFFF",
					"line-opacity": 0.9,
					"line-emissive-strength": 0.8,
				},
			});

			map.addLayer({
				id: "hkg",
				source: "hkg",
				type: "circle",
				paint: {
					"circle-radius": 6,
					"circle-color": "#00BFFF",
					"circle-emissive-strength": 1,
					"circle-stroke-width": 2,
					"circle-stroke-color": "#ffffff",
				},
			});

			// Label for HKG
			map.addLayer({
				id: "hkg-label",
				source: "hkg",
				type: "symbol",
				layout: {
					"text-field": ["get", "code"],
					"text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
					"text-size": 12,
					"text-offset": [0, 1.2],
					"text-anchor": "top",
				},
				paint: {
					"text-color": "#001e2b",
					"text-halo-color": "#ffffff",
					"text-halo-width": 1,
				},
			});
		});

		const onResize = () => map.resize();
		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
			map.remove();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="w-full h-full"
		/>
	);
}
