import { ScheduleExplorer } from "@/features/schedule/components/ScheduleExplorer";
import { getScheduleDataset } from "@/features/schedule/server/repository";

export default async function SchedulePage() {
	const dataset = await getScheduleDataset();

	return <ScheduleExplorer dataset={dataset} />;
}
