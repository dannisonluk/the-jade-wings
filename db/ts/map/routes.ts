import { airports } from "./airports";
// routes.ts
export const routes: [string, string][] = airports
	.filter((a) => a.code !== "HKG")
	.map((a) => ["HKG", a.code]);


// 	// routes.ts
// import { airports } from "./airports";

// export const routes: [string, string][] = airports
//   .filter((a) => a.code !== "HKG")
//   .map((a) => ["HKG", a.code])
//   // extra safety if routes get extended elsewhere
//   .filter(([src, dst]) => src !== dst);