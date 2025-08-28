"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";

mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

export default function Route() {
	const mapContainer = useRef<HTMLDivElement | null>(null);
	const map = useRef<mapboxgl.Map | null>(null);
	const animationRef = useRef<number>(0);

	useEffect(() => {
		if (!mapContainer.current) return;

		// Initialize the map
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: "mapbox://styles/mapbox/dark-v11", // Map style
			center: [113.9185, 22.308], // Hong Kong International Airport coordinates
			zoom: 2,
		});

		map.current.on("load", () => {
			// Define flight routes (example data)
			const routes = [
				{
					name: "Hong Kong to New York",
					coordinates: [
						[113.9185, 22.308], // Hong Kong
						[-73.7781, 40.6413], // New York
					],
				},
				{
					name: "Hong Kong to London",
					coordinates: [
						[113.9185, 22.308], // Hong Kong
						[-0.4543, 51.47], // London
					],
				},
			];

			// Add routes to the map
			routes.forEach((route, index) => {
				const lineString = turf.lineString(route.coordinates);

				// Add route line
				map.current?.addSource(`route-${index}`, {
					type: "geojson",
					data: lineString,
				});

				map.current?.addLayer({
					id: `route-${index}`,
					type: "line",
					source: `route-${index}`,
					layout: { "line-join": "round", "line-cap": "round" },
					paint: { "line-color": "#1db7dd", "line-width": 2 },
				});

				// Add a point to animate along the route
				map.current?.addSource(`point-${index}`, {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: [
							{
								type: "Feature",
								geometry: {
									type: "Point",
									coordinates: route.coordinates[0],
								},
							},
						],
					},
				});

				map.current?.addLayer({
					id: `point-${index}`,
					type: "circle",
					source: `point-${index}`,
					paint: { "circle-radius": 5, "circle-color": "#ff0000" },
				});

				// Animate the point along the route
				const routeLine = turf.lineString(route.coordinates);
				const lineDistance = turf.length(routeLine);

				let start = 0;
				const animate = () => {
					const point = turf.along(routeLine, start);
					map.current?.getSource(`point-${index}`)?.setData(point);
					start += lineDistance / 100; // Adjust speed
					if (start <= lineDistance) {
						animationRef.current = requestAnimationFrame(animate);
					}
				};

				animate();
			});
		});

		// Cleanup
		return () => {
			if (map.current) map.current.remove();
			cancelAnimationFrame(animationRef.current);
		};
	}, []);

	return (
		<div
			ref={mapContainer}
			style={{ width: "100%", height: "100vh" }}
		/>
	);
}
