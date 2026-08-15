"use client";

import dynamic from "next/dynamic";

import type { RoutePair } from "@/features/schedule/server/network";

const RouteMap = dynamic(() => import("./RouteMap2D"), {
	ssr: false,
});

export function RouteNetwork2D({ routes }: { routes: RoutePair[] }) {
	return <RouteMap routes={routes} />;
}
