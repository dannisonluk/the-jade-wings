import { promises as fs } from "fs";
import path from "path";

import type { ScheduleDataset } from "@/types/Schedule";
import { parseScheduleWorkbook } from "./workbook";

const SOURCE_FILE = "CathayCargo_Schedule_AUG2026.xlsx";
const SOURCE_PATH = path.join(process.cwd(), "public", "data", SOURCE_FILE);

let cache: { modifiedAt: number; dataset: ScheduleDataset } | null = null;

export async function getScheduleDataset(): Promise<ScheduleDataset> {
	const stat = await fs.stat(SOURCE_PATH);
	if (cache?.modifiedAt === stat.mtimeMs) return cache.dataset;

	const workbook = parseScheduleWorkbook(await fs.readFile(SOURCE_PATH), SOURCE_FILE);
	const schedule = workbook.records.sort((a, b) =>
		`${a.validFrom}${a.origin}${a.destination}${a.departureTime}${a.flightNumber}`.localeCompare(
			`${b.validFrom}${b.origin}${b.destination}${b.departureTime}${b.flightNumber}`,
		),
	);
	const regions = [
		...new Set(
			schedule.flatMap((record) => [record.originRegion, record.destinationRegion]).filter(Boolean),
		),
	].sort() as string[];
	const effectiveFrom = schedule.reduce(
		(earliest, record) => record.validFrom < earliest ? record.validFrom : earliest,
		schedule[0]?.validFrom ?? "",
	);
	const effectiveTo = schedule.reduce(
		(latest, record) => record.validTo > latest ? record.validTo : latest,
		schedule[0]?.validTo ?? "",
	);

	const dataset: ScheduleDataset = {
		schedule,
		meta: {
			title: workbook.title,
			schedulePeriod: workbook.schedulePeriod,
			disclaimer: workbook.disclaimer,
			lastModified: stat.mtime.toISOString(),
			recordCount: schedule.length,
			regions,
			sources: [
				{
					file: SOURCE_FILE,
					sheet: workbook.sheet,
					recordCount: workbook.rawRecordCount,
					acceptedCount: schedule.length,
					lastModified: stat.mtime.toISOString(),
				},
			],
			provenance: {
				provider: "Cathay Cargo",
				status: "provided-source",
				retrievedAt: workbook.dataCorrectAsOf,
				effectiveFrom,
				effectiveTo,
			},
			issues: workbook.issues,
		},
	};

	cache = { modifiedAt: stat.mtimeMs, dataset };
	return dataset;
}
