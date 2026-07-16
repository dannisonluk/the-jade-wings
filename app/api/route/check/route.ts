// app/api/route/check/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { resolveWithinRoot } from "@/lib/server/safe-path";

const ROOT = path.join(process.cwd(), "db", "route");

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const file = searchParams.get("file");

	if (!file) {
		return NextResponse.json(
			{ error: "No file specified" },
			{ status: 400 }
		);
	}

	try {
		const filePath = resolveWithinRoot(ROOT, file);
		let exists = true;
		try {
			const stat = await fs.stat(filePath);
			exists = stat.isFile();
		} catch {
			exists = false;
		}
		return NextResponse.json({ exists, path: file });
	} catch (error: unknown) {
		let errorMessage = "Unknown error";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		return NextResponse.json(
			{ exists: false, error: errorMessage },
			{ status: 400 }
		);
	}
}
