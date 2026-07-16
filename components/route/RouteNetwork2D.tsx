"use client";

import dynamic from "next/dynamic";

import type { RoutePair } from "@/lib/schedule/network";

const RouteMap = dynamic(() => import("@/components/route/RouteMap2D"), {
	ssr: false,
});

export function RouteNetwork2D({ routes }: { routes: RoutePair[] }) {
	return <RouteMap routes={routes} />;
}
