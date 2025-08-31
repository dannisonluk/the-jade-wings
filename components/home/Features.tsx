import Link from "next/link";
import Image from "next/image";

// components/home/Features.tsx
export default function Features() {
	return (
		<section
			id="features"
			className="bg-white"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
				{/* Section header */}
				<div className="mb-6 sm:mb-10">
					<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#004b47] text-center">
						Explore Cathay Pacific
					</h2>
					<p className="mt-2 text-center text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
						A comprehensive platform for tracking, discovering and
						sharing your Cathay Pacific experience
					</p>
				</div>

				{/* Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					<FeatureCard
						href="/flight_search"
						title="Flight Lookup"
						body="Check your next flight’s aircraft type, seat configuration and amenities"
						img={{
							src: "/images/features/flight.jpg",
							alt: "Airplane taking off",
						}}
					/>

					<FeatureCard
						href="/schedule"
						title="Flight Schedule"
						body="View weekly schedules for all Cathay Pacific flights"
						img={{
							src: "/images/features/schedule.jpg",
							alt: "Timetable board",
						}}
					/>

					<FeatureCard
						href="/route/2d_map"
						title="Route Network"
						body="Explore Cathay Pacific’s full global coverage"
						img={{
							src: "/images/features/routes.png",
							alt: "World map with routes",
						}}
					/>

					<FeatureCard
						href="/lounge"
						title="Lounge Guide"
						body="Complete guide to Cathay Pacific lounges worldwide with amenities and access"
						img={{
							src: "/images/features/lounge.jpg",
							alt: "Premium lounge interior",
						}}
					/>

					<FeatureCard
						href="/fleet"
						title="Fleet Explorer"
						body="Discover Cathay Pacific’s entire fleet with detailed specs and seat maps"
						img={{
							src: "/images/features/fleet.webp",
							alt: "Cathay aircraft parked at gate",
						}}
					/>
				</div>
			</div>
		</section>
	);
}

/**
 * Feature card with optional image banner and "coming soon" handling.
 */
function FeatureCard({
	href,
	title,
	body,
	img,
	chipTone = "from-emerald-50 to-teal-50",
}: {
	href: string;
	title: string;
	body: string;
	img?: { src: string; alt: string };
	chipTone?: string;
}) {
	// const isComingSoon = title.trim().toLowerCase() === "lounge guide";
	const isComingSoon = false; // Disable "coming soon" for now

	const CardInner = (
		<>
			{/* Banner */}
			<div className="relative">
				<div className="relative w-full overflow-hidden lg:h-28">
					<div className="aspect-[16/9] sm:aspect-[2/1] lg:aspect-auto lg:h-full">
						{img ? (
							<Image
								src={img.src}
								alt={img.alt}
								fill
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								className={`object-cover transition-opacity ${
									isComingSoon ? "opacity-80" : "opacity-100"
								}`}
								priority={false}
							/>
						) : (
							<div
								className={`absolute inset-0 bg-gradient-to-br ${chipTone}`}
							>
								<div className="absolute inset-0 opacity-40 bg-[radial-gradient(120px_80px_at_20%_20%,#0fa39a15,transparent_60%),radial-gradient(160px_120px_at_80%_60%,#0fa39a10,transparent_60%)]" />
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Text content */}
			<div className="p-4 sm:p-5">
				<h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
					{title}
				</h3>
				<p className="mt-1 text-sm text-gray-600 leading-relaxed">
					{body}
				</p>

				{/* CTA */}
				{isComingSoon ? (
					<div
						aria-disabled="true"
						className="mt-3 sm:mt-4 inline-flex items-center text-gray-400 font-medium text-sm cursor-not-allowed select-none"
						title="This feature is coming soon"
					>
						Coming soon
					</div>
				) : (
					<div className="mt-3 sm:mt-4 inline-flex items-center text-[#0fa39a] font-medium text-sm">
						<span>Explore</span>
						<svg
							className="ml-1.5 h-4 w-4 transform transition-transform group-hover:translate-x-0.5"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden
						>
							<path
								fillRule="evenodd"
								d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				)}
			</div>
		</>
	);

	// If coming soon, render a non-link wrapper with disabled styles; else render normal Link
	if (isComingSoon) {
		return (
			<div className="group rounded-2xl overflow-hidden bg-white ring-1 ring-gray-200 focus:outline-none transition opacity-100">
				{CardInner}
			</div>
		);
	}

	return (
		<Link
			href={href}
			className="group rounded-2xl overflow-hidden bg-white ring-1 ring-gray-200 hover:ring-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0fa39a] transition"
		>
			{CardInner}
		</Link>
	);
}
