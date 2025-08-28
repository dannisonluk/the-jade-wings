import { airports } from "./airports";
// routes.ts
export const routes: [string, string][] = airports
	.filter((a) => a.code !== "HKG")
	.map((a) => ["HKG", a.code]);
