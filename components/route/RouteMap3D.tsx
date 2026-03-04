/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import mapboxgl, { Map, CustomLayerInterface } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "flag-icons/css/flag-icons.min.css";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import * as turf from "@turf/turf";
import { greatCircle } from "@turf/great-circle";
import type { Feature, FeatureCollection, LineString } from "geojson";

import { airports } from "@/db/ts/map/airports";
import { routes } from "@/db/ts/map/routes";

type LngLat = [number, number];
const HK: LngLat = [114.1694, 22.3193];

// Map country strings -> ISO 3166-1 alpha-2 (lowercase for flag-icons)
const COUNTRY_TO_ISO2: Record<string, string> = {
	China: "cn",
	"Taiwan, China": "xx",
	"South Africa": "za",
	Canada: "ca",
	USA: "us",
	Bangladesh: "bd",
	Cambodia: "kh",
	India: "in",
	Indonesia: "id",
	Japan: "jp",
	"Hong Kong": "hk",
	Philippines: "ph",
	Vietnam: "vn",
	"South Korea": "kr",
	Malaysia: "my",
	Singapore: "sg",
	"Sri Lanka": "lk",
	Thailand: "th",
	Nepal: "np",
	Australia: "au",
	"New Zealand": "nz",
	Belgium: "be",
	France: "fr",
	Germany: "de",
	Italy: "it",
	Netherlands: "nl",
	Spain: "es",
	Switzerland: "ch",
	"United Kingdom": "gb",
	Israel: "il",
	"Saudi Arabia": "sa",
	UAE: "ae",
};

function toIso2(country: string): string | undefined {
	return COUNTRY_TO_ISO2[country];
}

export default function RouteMap3D() {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<Map | null>(null);

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

		map.on("style.load", () => {
			map.setFog({
				color: "hsl(200, 10%, 85%)",
				"high-color": "hsl(200, 10%, 100%)",
				"horizon-blend": 0.05,
				"space-color": "#000000",
				"star-intensity": 0.0,
			});
		});

		map.on("load", () => {
			// ✅ Build routes
			const features: Feature<LineString>[] = [];
			for (const [srcCode, dstCode] of routes) {
				if (srcCode === dstCode) continue;
				const src = airports.find((a) => a.code === srcCode);
				const dst = airports.find((a) => a.code === dstCode);
				if (!src || !dst) continue;

				const gc = greatCircle(
					turf.point([src.lon, src.lat]),
					turf.point([dst.lon, dst.lat]),
					{ npoints: 100 },
				);

				features.push({
					type: "Feature",
					properties: { src: srcCode, dst: dstCode },
					geometry: gc.geometry as LineString,
				});
			}

			const routesFC: FeatureCollection<LineString> = {
				type: "FeatureCollection",
				features,
			};

			// ✅ Add source & line layer for routes
			map.addSource("routes", { type: "geojson", data: routesFC });
			map.addLayer({
				id: "routes",
				source: "routes",
				type: "line",
				paint: {
					"line-width": 1.5,
					"line-color": "#006563",
					"line-opacity": 0.9,
					"line-emissive-strength": 0.8,
				},
			});

			// ✅ Add DOM Markers for airports with flag-icons
			airports.forEach((a) => {
				const iso2 = toIso2(a.country);
				const el = document.createElement("div");
				el.style.display = "flex";
				el.style.alignItems = "center";
				el.style.gap = "6px";
				el.style.padding = "2px 6px";
				el.style.borderRadius = "12px";
				el.style.background = "rgba(255,255,255,0.9)";
				el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
				el.style.font = "600 12px system-ui, sans-serif";
				el.style.color = "#0f172a";

				if (iso2) {
					const flag = document.createElement("span");
					flag.className = `fi fi-${iso2}`;
					flag.style.width = "16px";
					flag.style.height = "12px";
					el.appendChild(flag);
				}

				const code = document.createElement("span");
				code.textContent = a.code;
				el.appendChild(code);

				new mapboxgl.Marker({ element: el })
					.setLngLat([a.lon, a.lat])
					.addTo(map);
			});

			// ✅ 3D airplane layer
			const customLayer: CustomLayerInterface = {
				id: "3d-airplanes",
				type: "custom",
				renderingMode: "3d",
				onAdd: function (mapInstance: Map, gl: WebGLRenderingContext) {
					const scene = new THREE.Scene();
					const camera = new THREE.Camera();
					const renderer = new THREE.WebGLRenderer({
						canvas: mapInstance.getCanvas(),
						context: gl,
					});
					renderer.autoClear = false;

					// Load GLB airplane
					const loader = new GLTFLoader();
					loader.load(
						"/models/cathay_pacific_airbus_a330-300.glb",
						(gltf) => {
							const airplane = gltf.scene;
							airplane.scale.set(20000, 20000, 20000);
							scene.add(airplane);

							// Animate airplane along first route
							const route = routesFC.features[0];
							if (route) {
								let progress = 0;
								mapInstance.on("render", () => {
									if (progress <= 1) {
										const coords = route.geometry
											.coordinates as number[][];
										const idx = Math.floor(
											progress * (coords.length - 1),
										);
										const [lon, lat] = coords[idx];
										const pos =
											mapboxgl.MercatorCoordinate.fromLngLat(
												{ lon, lat },
												0,
											);
										airplane.position.set(
											pos.x,
											pos.y,
											pos.z || 0,
										);
										progress += 0.002;
									}
								});
							}
						},
					);

					(this as any).scene = scene;
					(this as any).camera = camera;
					(this as any).renderer = renderer;
				},
				render: function (gl: WebGLRenderingContext, matrix: number[]) {
					const m = new THREE.Matrix4().fromArray(matrix);
					(this as any).camera.projectionMatrix = m;
					(this as any).renderer.state.reset();
					(this as any).renderer.render(
						(this as any).scene,
						(this as any).camera,
					);
					map.triggerRepaint();
				},
			};
			map.addLayer(customLayer);
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
			className="w-full h-full relative"
		/>
	);
}
