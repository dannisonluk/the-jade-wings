// app/api/route/check/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const file = searchParams.get("file");

	if (!file) {
		return NextResponse.json(
			{ error: "No file specified" },
			{ status: 400 }
		);
	}

	const filePath = path.join(process.cwd(), "db", "route", file);

	try {
		const exists = fs.existsSync(filePath);
		return NextResponse.json({ exists, path: file });
	} catch (error: unknown) {
		let errorMessage = "Unknown error";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		return NextResponse.json(
			{ exists: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
