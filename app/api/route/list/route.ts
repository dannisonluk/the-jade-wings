import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type FileTree = Record<string, Record<string, string[]>>;

const ROOT = path.join(process.cwd(), "data", "source", "route-tracks");

async function readDirNames(dir: string): Promise<string[]> {
	const items = await fs.readdir(dir, { withFileTypes: true });
	return items
		.filter((item) => item.isDirectory())
		.map((item) => item.name)
		.sort((a, b) => a.localeCompare(b));
}

async function buildRouteTree(): Promise<FileTree> {
	const tree: FileTree = {};
	const regions = await readDirNames(ROOT);

	for (const region of regions) {
		const regionPath = path.join(ROOT, region);
		const ports = await readDirNames(regionPath);
		tree[region] = {};

		for (const port of ports) {
			const portPath = path.join(regionPath, port);
			const files = await fs.readdir(portPath, { withFileTypes: true });
			tree[region][port] = files
				.filter((file) => file.isFile() && file.name.endsWith(".csv"))
				.map((file) => file.name)
				.sort((a, b) => a.localeCompare(b));
		}
	}

	return tree;
}

export async function GET() {
	try {
		const tree = await buildRouteTree();
		return NextResponse.json(tree, {
			headers: { "Cache-Control": "public, max-age=60" },
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unable to list route files.";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
