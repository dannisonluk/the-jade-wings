import Link from "next/link";

import { RouteNetwork2D } from "@/components/route/RouteNetwork2D";
import { getScheduleRoutePairs } from "@/lib/schedule/network";
import { getScheduleDataset } from "@/lib/schedule/repository";

export default async function Page() {
	const dataset = await getScheduleDataset();
	const routes = getScheduleRoutePairs(dataset.schedule);

	return (
		<main className="bg-slate-50 text-slate-900 flex flex-col">
			{/* Top header */}
			<header className="relative z-[1000000000]">
				<div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
					<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
						<h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
							Cathay Cargo Route Map
						</h1>
						<p className="mt-1 text-sm text-white/90">
							Explore routes in the current published timetable snapshot.
						</p>
						<Link href="/route/3d_map">
							<span className="mt-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-700 shadow-sm">
								Click here to try the 3D version
							</span>
						</Link>
					</div>
				</div>

				{/* Instruction ribbon */}
				<div className="bg-emerald-50 border-b border-emerald-100">
					<div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
						<p className="flex items-center gap-2 text-emerald-900 text-sm sm:text-[15px]">
							<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] font-bold">
								i
							</span>
							Tip: Press on the ports on the map to see the
							airport information.
						</p>
					</div>
				</div>
			</header>

			{/* Content */}
			<section className="flex-1">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
					{/* Toolbar area */}
					<div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-700 shadow-sm">
							Published timetable network
							<span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
						</span>
						<span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-700 shadow-sm">
							Route line
							<span className="inline-block h-[3px] w-6 rounded-full bg-[rgba(14,165,233,0.8)]"></span>
						</span>
					</div>

					{/* Map card */}
					<div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
						<div className="h-[50vh] sm:h-[70vh] lg:h-[72vh] min-h-[420px]">
							<RouteNetwork2D routes={routes} />
						</div>

						{/* Footer hint */}
						<div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
							<p className="truncate">
								Pan, zoom and tap an airport to view detailed
								information.
							</p>
							<div className="hidden sm:flex items-center gap-3">
								<kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 shadow-xs">
									Drag
								</kbd>
								<span>to move</span>
								<kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 shadow-xs">
									Scroll
								</kbd>
								<span>to zoom</span>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
