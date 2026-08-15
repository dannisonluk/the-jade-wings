import { NextResponse } from "next/server";

import { getScheduleDataset } from "@/features/schedule/server/repository";

export async function GET() {
	const dataset = await getScheduleDataset();
	return NextResponse.json(dataset, {
		headers: {
			"Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
		},
	});
}
