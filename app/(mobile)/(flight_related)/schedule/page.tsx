import { ScheduleExplorer } from "@/components/schedule/ScheduleExplorer";
import { getScheduleDataset } from "@/lib/schedule/repository";

export default async function SchedulePage() {
	const dataset = await getScheduleDataset();

	return <ScheduleExplorer dataset={dataset} />;
}
