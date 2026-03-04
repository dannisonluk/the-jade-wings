// app/api/route/check/route.ts
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "db", "route");

function safeJoin(root: string, subpath: string) {
	const normalized = path.normalize(subpath).replace(/^(\.\.(\/|\\|$))+/, "");
	const fullPath = path.join(root, normalized);
	if (!fullPath.startsWith(root)) {
		throw new Error("Invalid path.");
	}
	return fullPath;
}

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
		const filePath = safeJoin(ROOT, file);
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
			{ status: 500 }
		);
	}
}
