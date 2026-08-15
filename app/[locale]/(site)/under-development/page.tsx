// app/under_development/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function UnderDevelopment() {
	return (
		<main className="flex items-center justify-center px-5 py-4">
			<section className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-[color:#b5b1b6]/40 overflow-hidden">
				{/* Top accent bar */}
				<div className="h-1.5 bg-[color:#007c7c]" />

				<div className="p-6 sm:p-8 text-center">
					<div className="mx-auto mb-5 grid place-items-center rounded-xl bg-gradient-to-br from-[color:#6fae96]/20 via-[color:#40917e]/15 to-[color:#007c7c]/20 p-3 w-[min(72vw,260px)]">
						<div className="relative w-full h-auto aspect-[4/5]">
							<Image
								src="/images/misc/under_development.jpeg"
								alt="Under development"
								fill
								priority
								className="object-contain rounded-md"
								sizes="(max-width: 640px) 72vw, 260px"
							/>
						</div>
					</div>

					<h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[color:#0b3a3a]">
						AI Travel Assistant Is Offline
					</h1>

					<p className="mt-3 text-[15px] leading-relaxed text-[color:#48615a]">
						This feature has been shut down due to high API token
						consumption.
					</p>

					<p className="mt-1 text-[15px] leading-relaxed text-[color:#48615a]">
						Vector database operating costs are also currently too
						high to sustain.
					</p>

					<p className="mt-1 text-[15px] leading-relaxed text-[color:#48615a]">
						Thank you for understanding while we evaluate a more
						cost-efficient relaunch.
					</p>

					<div className="mt-2 flex items-center justify-center gap-3">
						<Link
							href="/"
							className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-[color:#007c7c] hover:bg-[color:#006d6d] focus:outline-none focus:ring-2 focus:ring-[color:#6fae96] focus:ring-offset-2 focus:ring-offset-white transition"
						>
							Go to Home
						</Link>
					</div>
				</div>

				{/* Subtle footer strip */}
				<div className="flex items-center justify-center gap-1.5 bg-[color:#f6f7f7] px-4 py-3 text-xs text-[color:#5e676a]">
					<span
						className="inline-block h-2 w-2 rounded-full bg-[color:#007c7c]"
						aria-hidden="true"
					/>
					<span>Thank you for your patience</span>
				</div>
			</section>
		</main>
	);
}
