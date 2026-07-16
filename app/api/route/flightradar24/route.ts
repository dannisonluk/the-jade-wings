// app/api/route/flightradar24/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { resolveWithinRoot } from "@/lib/server/safe-path";

// Root folder where your CSVs live (db/route/...)
const ROOT = path.join(process.cwd(), "db", "route");

export async function GET(req: Request) {
	const url = new URL(req.url);
	const file = url.searchParams.get("file"); // e.g. "EUR/CDG/CX261 - 13Sep2025.csv"
	if (!file) return new NextResponse("Missing file", { status: 400 });

	try {
		if (!file.endsWith(".csv")) {
			return new NextResponse("Invalid file type", { status: 400 });
		}
		const csvPath = resolveWithinRoot(ROOT, file);
		const data = await fs.readFile(csvPath, "utf8");
		return new NextResponse(data, {
			status: 200,
			headers: { "Content-Type": "text/csv; charset=utf-8" },
		});
	} catch (err) {
		console.error("CSV read error:", err);
		return new NextResponse("Not found", { status: 404 });
	}
}
