"use client";
import { useMemo, useState, useCallback } from "react";
import {
	MapsComponent,
	LayersDirective,
	LayerDirective,
	Inject,
	Zoom,
	Marker,
	NavigationLine,
	MapsTooltip,
	IMapZoomEventArgs,
} from "@syncfusion/ej2-react-maps";
import type {
	NavigationLineSettingsModel,
	MarkerSettingsModel,
	TooltipSettingsModel,
} from "@syncfusion/ej2-react-maps";
import { registerLicense } from "@syncfusion/ej2-base";

registerLicense(
	"Ngo9BigBOggjHTQxAR8/V1NAaF5cWWJCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdgWH1cdnZWQ2FZUEB/V0c="
);

import "flag-icons/css/flag-icons.min.css";

import * as worldMap from "@/db/json/map/world_geo.json";
import { airports } from "@/db/ts/map/airports";
import type { RoutePair } from "@/lib/schedule/network";

// Map your exact country strings -> ISO 3166-1 alpha-2 (lowercase for flag-icons)
const COUNTRY_TO_ISO2: Record<string, string> = {
	China: "cn",
	Taiwan: "tw",
	"Taiwan, China": "tw",
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

type AirportMarker = {
	latitude: number;
	longitude: number;
	code: string;
	name: string;
	city: string;
	country: string;
	iso2?: string; // lowercase ISO code for flag-icons (fi fi-xx)
};

function toIso2(country: string): string | undefined {
	return COUNTRY_TO_ISO2[country];
}

export default function RouteMap({ routes }: { routes: RoutePair[] }) {
	const servedAirportCodes = useMemo(() => new Set(routes.flat()), [routes]);
	const airportByCode = useMemo(
		() => new Map(airports.map((airport) => [airport.code, airport])),
		[]
	);

	// Build markers with iso2 for flag-icons
	const markers = useMemo<AirportMarker[]>(
		() =>
			airports.filter((a) => servedAirportCodes.has(a.code)).map((a) => ({
				latitude: a.lat,
				longitude: a.lon,
				code: a.code,
				name: a.name,
				city: a.city,
				country: a.country,
				iso2: toIso2(a.country),
			})),
		[servedAirportCodes]
	);

	// Build routes
	const navLines = useMemo<NavigationLineSettingsModel[]>(
		() =>
			routes
				.map((r) => {
					const from = airportByCode.get(r[0]);
					const to = airportByCode.get(r[1]);
					if (!from || !to) return null;
					const item: NavigationLineSettingsModel = {
						visible: true,
						latitude: [from.lat, to.lat],
						longitude: [from.lon, to.lon],
						color: "rgba(14,165,233,0.7)",
						width: 1.5,
						dashArray: "0",
						angle: 0,
					};
					return item;
				})
				.filter((x): x is NavigationLineSettingsModel => x !== null),
		[airportByCode, routes]
	);

	// Zoom state
	const [zoomFactor, setZoomFactor] = useState(1);
	const labelZoomThreshold = 3;
	const handleZoom = useCallback((args: IMapZoomEventArgs) => {
		const z = typeof args.scale === "number" ? args.scale : 1;
		setZoomFactor(z);
	}, []);

	// Tooltip template using flag-icons class
	const tooltipTemplate = `
    <div style="
      display:flex; align-items:center; gap:8px;
      padding:8px 10px; background:rgba(255,255,255,0.97);
      border:1px solid #e5e7eb; border-radius:10px;
      box-shadow:0 6px 18px rgba(0,0,0,0.08);
      font:500 12px system-ui,-apple-system,Segoe UI,Roboto,Arial;
      color:#0f172a; max-width:260px;
    ">
      <span class="fi fi-${"${iso2}"}" style="width:22px; height:16px; border-radius:3px; flex:0 0 auto;"></span>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-weight:650; font-size:13px; color:#0b1220;">${"${name}"}</span>
          <span style="
            padding:1px 6px; border-radius:9999px;
            background:#e0f2fe; color:#075985; border:1px solid #bae6fd;
            font-weight:700; font-size:11px; letter-spacing:0.3px;
          ">${"${code}"}</span>
        </div>
        <div style="font-weight:500; font-size:12px; color:#334155;">
          ${"${city}"}, ${"${country}"}
        </div>
      </div>
    </div>
  `;

	const baseMarker: MarkerSettingsModel = {
		visible: true,
		dataSource: markers,
		height: 10,
		width: 10,
		shape: "Circle",
		fill: "#16a34a",
		border: { color: "#ffffff", width: 2 },
		tooltipSettings: {
			visible: true,
			template: tooltipTemplate,
		} as TooltipSettingsModel,
	};

	const labelMarker: MarkerSettingsModel | null =
		zoomFactor >= labelZoomThreshold
			? {
					visible: true,
					dataSource: markers,
					height: 0,
					width: 0,
					template: `
            <div style="
              transform:translate(-50%, -165%);
              display:inline-flex; align-items:center; gap:6px;
              white-space:nowrap; background:rgba(255,255,255,0.95);
              border:1px solid #e5e7eb; padding:2px 6px; border-radius:9999px;
              box-shadow:0 4px 12px rgba(0,0,0,0.06);
              font:700 12px system-ui,-apple-system,Segoe UI,Roboto,Arial;
              color:#0f172a;
            ">
              <span class="fi fi-${"${iso2}"}" style="width:16px; height:12px; border-radius:2px;"></span>
              <span>${"${code}"}</span>
            </div>
          `,
			  }
			: null;

	return (
		<MapsComponent
			useGroupingSeparator={true}
			zoomSettings={{
				enable: true,
				minZoom: 1,
				maxZoom: 50,
				zoomFactor: 1,
				mouseWheelZoom: true,
				pinchZooming: true,
				doubleClickZoom: true,
				enablePanning: true,
			}}
			zoom={handleZoom}
			tooltipDisplayMode="Click"
			height="100%"
			width="100%"
		>
			<Inject services={[Zoom, Marker, NavigationLine, MapsTooltip]} />
			<LayersDirective>
				<LayerDirective
					shapeData={worldMap}
					shapeSettings={{
						fill: "#eef2ff",
						border: { color: "#c7d2fe", width: 0.5 },
					}}
					navigationLineSettings={navLines}
					markerSettings={[
						baseMarker,
						...(labelMarker ? [labelMarker] : []),
					]}
				/>
			</LayersDirective>
		</MapsComponent>
	);
}
