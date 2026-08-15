import RouteMap3D from "@/features/routes/components/RouteMap3D";
import { getScheduleRoutePairs } from "@/features/schedule/server/network";
import { getScheduleDataset } from "@/features/schedule/server/repository";

export default async function Page() {
	const dataset = await getScheduleDataset();
	const routes = getScheduleRoutePairs(dataset.schedule);

	return (
		<div className="h-[calc(100vh-56px-56px)] grid grid-rows-[auto,1fr]">
			<div className="min-h-0">
				<RouteMap3D routes={routes} />
			</div>
		</div>
	);
}
