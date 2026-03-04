import Image from "next/image";
import FriendsExchangePanel from "@/components/world_of_airports/FriendsExchangePanel";

export default function WorldOfAirportsPage() {
	return (
		<main className="min-h-screen bg-slate-50">
			<section className="relative isolate overflow-hidden">
				<div className="relative h-[38vh] min-h-[280px] sm:h-[44vh]">
					<Image
						src="/images/background/world_of_airports-bg.jpeg"
						alt="Cathay Pacific aircraft near Hong Kong International Airport terminal"
						fill
						priority
						className="object-cover"
						sizes="100vw"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-slate-900/45 via-slate-900/40 to-slate-950/70" />
					<div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-7 sm:px-6 sm:pb-10">
						<h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
							World of Airports - HKG Alliance Hub
						</h1>
						<p className="mt-2 max-w-3xl text-sm text-slate-100 sm:text-base">
							Please feel free to send your carriers to my HKG
							airport. My ID is{" "}
							<span className="font-semibold text-white">
								DragonAir HK
							</span>
							.
						</p>
					</div>
				</div>
			</section>

			<section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 sm:grid-cols-2 sm:gap-6 sm:px-6 sm:py-8">
				<div className="space-y-4">
					<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">
							About My Fleet
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-slate-600">
							I am a DragonAir fan and currently operate a huge A346 and 78M fleet, plus
							some 333 and B787 fleets. If you add your ID below,
							I can send my carriers to your airport too.
						</p>
					</div>

					<div className="rounded-xl border border-teal-100 bg-teal-50 p-5">
						<h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800">
							How it works
						</h3>
						<ul className="mt-2 space-y-1 text-sm text-teal-900">
							<li>1. Share your nickname and game ID.</li>
							<li>2. I will add you from HKG: DragonAir HK.</li>
							<li>
								3. We can exchange carriers and build traffic
								together.
							</li>
						</ul>
					</div>
				</div>

				<FriendsExchangePanel />
			</section>
		</main>
	);
}
