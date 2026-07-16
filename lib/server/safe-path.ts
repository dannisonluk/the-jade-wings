import path from "path";

export function resolveWithinRoot(root: string, relativePath: string): string {
	if (!relativePath || path.isAbsolute(relativePath) || relativePath.includes("\0")) {
		throw new Error("Invalid relative path.");
	}

	const resolvedRoot = path.resolve(root);
	const resolvedPath = path.resolve(resolvedRoot, relativePath);
	const relationship = path.relative(resolvedRoot, resolvedPath);

	if (
		relationship === "" ||
		relationship.startsWith(`..${path.sep}`) ||
		relationship === ".." ||
		path.isAbsolute(relationship)
	) {
		throw new Error("Path escapes the data directory.");
	}

	return resolvedPath;
}
