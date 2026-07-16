import RouteMap3D from "@/components/route/RouteMap3D";
import { getScheduleRoutePairs } from "@/lib/schedule/network";
import { getScheduleDataset } from "@/lib/schedule/repository";

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
