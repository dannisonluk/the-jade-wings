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

				{/* Flight Information Section */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold text-[#004b47] mb-4">
						Flight Information
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<FeatureCard
							href="/flight_search"
							title="Flight Lookup"
							body="Check your next flight's aircraft type, seat configuration and amenities"
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
					</div>
				</div>

				{/* Network & Routes Section */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold text-[#004b47] mb-4">
						Network & Coverage
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<RouteNetworkCard isNew={true} />
					</div>
				</div>

				{/* Travel Experience Section */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold text-[#004b47] mb-4">
						Travel Experience
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<FeatureCard
							href="/lounges"
							title="Lounge Guide"
							body="Complete guide to Cathay Pacific lounges worldwide with amenities and access"
							img={{
								src: "/images/features/lounge.jpg",
								alt: "Premium lounge interior",
							}}
						/>
					</div>
				</div>

				{/* Fans Playground Section */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold text-[#004b47] mb-4">
						Fans Playground
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<FeatureCard
							href="/route/specific_route"
							title="3D Historical Route Visualizer"
							body="Decide the side to sit for the best window view"
							img={{
								src: "/images/features/3d_flight_route.webp",
								alt: "3D flight visualization",
							}}
							isNew={true}
						/>

						<FeatureCard
							href="/fleet"
							title="Fleet Explorer"
							body="Discover Cathay Pacific's entire fleet with detailed specs and seat maps"
							img={{
								src: "/images/features/fleet.webp",
								alt: "Cathay aircraft parked at gate",
							}}
						/>
					</div>
				</div>

				{/* User Support Section */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold text-[#004b47] mb-4">
						User Support
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<FeatureCard
							href="/under_development"
							title="AI Travel Assistant"
							body="Get instant answers about flights, bookings, and Cathay Pacific services"
							img={{
								src: "/images/features/call_center.jpg",
								alt: "AI chatbot interface",
							}}
							isNew={true}
							chipTone="from-purple-50 to-indigo-50"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

/**
 * Special Route Network card with dual view options
 */
function RouteNetworkCard({ isNew = false }: { isNew?: boolean }) {
	return (
		<div className="group rounded-2xl overflow-hidden bg-white ring-1 ring-gray-200 hover:ring-gray-300 transition">
			{/* Banner */}
			<div className="relative">
				{/* New badge */}
				{isNew && (
					<div className="absolute top-2 right-2 z-10">
						<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-[#0fa39a] to-[#00897b] text-white shadow-sm">
							New
						</span>
					</div>
				)}

				<div className="relative w-full overflow-hidden lg:h-28">
					<div className="aspect-[16/9] sm:aspect-[2/1] lg:aspect-auto lg:h-full">
						<Image
							src="/images/features/routes.png"
							alt="World map with routes"
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							className="object-cover"
							priority={false}
						/>
					</div>
				</div>
			</div>

			{/* Text content */}
			<div className="p-4 sm:p-5">
				<h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">
					Route Network
				</h3>
				<p className="mt-1 text-sm text-gray-600 leading-relaxed">
					Explore Cathay Pacific&apos;s full global coverage with
					interactive 2D map or 3D globe view
				</p>

				{/* Dual CTA buttons */}
				<div className="mt-4 flex gap-3">
					<Link
						href="/route/2d_map"
						className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-[#004b47] bg-white border border-[#0fa39a] rounded-lg hover:bg-[#0fa39a] hover:text-white transition-colors"
					>
						<svg
							className="mr-1.5 h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
							/>
						</svg>
						2D Map
					</Link>

					<Link
						href="/route/3d_map"
						className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#0fa39a] to-[#00897b] rounded-lg hover:from-[#00897b] hover:to-[#00695c] transition-colors"
					>
						<svg
							className="mr-1.5 h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						3D Globe
					</Link>
				</div>
			</div>
		</div>
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
	isNew = false,
}: {
	href: string;
	title: string;
	body: string;
	img?: { src: string; alt: string };
	chipTone?: string;
	isNew?: boolean;
}) {
	const isComingSoon = false; // Disable "coming soon" for now

	const CardInner = (
		<>
			{/* Banner */}
			<div className="relative">
				{/* New badge */}
				{isNew && (
					<div className="absolute top-2 right-2 z-10">
						<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-[#0fa39a] to-[#00897b] text-white shadow-sm">
							New
						</span>
					</div>
				)}

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
