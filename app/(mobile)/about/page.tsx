// app/about/page.tsx

export default function AboutPage() {
	return (
		<main className="min-h-screen bg-white">
			<header className="bg-gradient-to-b from-teal-50 to-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:py-14">
					<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#004b47]">
						About this project
					</h1>
					<p className="mt-3 text-gray-600">
						A community-driven, non‑official companion built for
						aviation enthusiasts and frequent flyers.
					</p>
				</div>
			</header>

			<section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
				{/* Mission */}
				<article className="space-y-3">
					<h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
						Purpose
					</h2>
					<p className="text-gray-700 leading-relaxed">
						This website is a passion project designed to make it
						easier to explore flights, aircraft, routes and related
						information. It is not affiliated with, endorsed by, or
						operated by Cathay Pacific or any airline or airport
						authority.
					</p>
				</article>

				{/* Non-official disclaimer */}
				<article className="space-y-3">
					<h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
						Non‑official and non‑profit
					</h2>
					<p className="text-gray-700 leading-relaxed">
						This is a non‑official, non‑profit application. It
						exists solely for educational and informational purposes
						and does not sell products, services, or memberships.
					</p>
				</article>

				{/* Data sources */}
				<article className="space-y-3">
					<h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
						Data sources and attribution
					</h2>
					<p className="text-gray-700 leading-relaxed">
						Some information displayed here may be derived from
						third‑party sources, including but not limited to:
					</p>
					<ul className="list-disc pl-5 text-gray-700 space-y-1">
						<li>
							Flight tracking and schedule data from public
							endpoints and services such as Flightradar24 and
							FlightAware where permitted for non-commercial use.
						</li>
						<li>
							Publicly available airline resources and community
							contributions.
						</li>
						<li>
							Images from public or royalty‑free sources or media
							explicitly licensed for reuse.
						</li>
					</ul>
					<p className="text-sm text-gray-500">
						All trademarks, logos and brand names are the property
						of their respective owners. Use here is for
						identification purposes only.
					</p>
				</article>

				{/* Accuracy and update policy */}
				<article className="space-y-3">
					<h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
						Accuracy, timeliness and updates
					</h2>
					<p className="text-gray-700 leading-relaxed">
						While we aim to present helpful and accurate
						information, data can change rapidly and may be
						incomplete, incorrect, or outdated. The website owner makes
						no warranties regarding accuracy, reliability, or
						availability.
					</p>
					<p className="text-gray-700 leading-relaxed">
						Content is reviewed and updated periodically as time
						permits. However, there is no guarantee of immediate or
						continuous updates.
					</p>
				</article>

				{/* Responsibility disclaimer */}
				<article className="space-y-3">
					<h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
						Responsibility and use
					</h2>
					<p className="text-gray-700 leading-relaxed">
						The owner is not responsible for errors, omissions,
						delays, or actions taken based on the information
						provided. Always verify details with official airline
						channels before making travel decisions.
					</p>
				</article>

				{/* Contact / takedown */}
				<article className="space-y-3">
					<h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
						Feedback and takedown
					</h2>
					<p className="text-gray-700 leading-relaxed">
						If you are a rights holder or find content that should
						be updated or removed, please contact us with details.
						We’ll review and address it promptly.
					</p>
				</article>

				{/* Last updated */}
				<div className="pt-2 border-t border-gray-200">
					<p className="text-sm text-gray-500">
						Last updated: {new Date().toLocaleDateString()}
					</p>
				</div>
			</section>
		</main>
	);
}
