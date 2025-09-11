// app/route/3d_map/page.tsx

import RouteMap3D from "@/components/route/RouteMap3D";

export default function Page() {
	return (
		<div className="h-[calc(100vh-56px-68px)] grid grid-rows-[auto,1fr]">
			<div className="min-h-0">
				<RouteMap3D />
			</div>
		</div>
	);
}
