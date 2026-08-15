// app/lounges/page.tsx

import Image from "next/image";
import Link from "next/link";

export const metadata = {
	title: "Lounges | Services & Amenities",
	description:
		"Discover Cathay-style lounge services and amenities. A non-official, community-built resource for travelers.",
};

const lounges = [
	{ name: "Hong Kong", open: true, href: "#" },
	{ name: "Shanghai Pudong", open: true, href: "#" },
	{ name: "Shenzhen", open: true, href: "#" },
	{ name: "Beijing", open: true, href: "#" },
	{ name: "Taipei", open: true, href: "#" },
	{ name: "Vancouver", open: true, href: "#" },
	{ name: "San Francisco", open: true, href: "#" },
	{ name: "Tokyo Haneda", open: true, href: "#" },
	{ name: "Tokyo Narita", open: true, href: "#" },
	{ name: "Manila", open: true, href: "#" },
	{ name: "Singapore", open: true, href: "#" },
	{ name: "Bangkok", open: true, href: "#" },
	{ name: "Paris", open: false, href: "#" },
	{ name: "London", open: true, href: "#" },
];

const amenities = [
	{ icon: "🍜", text: "Dining: Buffet and à la carte options" },
	{ icon: "☕", text: "Barista-crafted coffee and premium teas" },
	{ icon: "🚿", text: "Shower suites (available at select locations)" },
	{ icon: "🛋️", text: "Quiet zones and relaxation areas" },
	{ icon: "💼", text: "Workspaces with high-speed Wi‑Fi" },
	{ icon: "👨‍👩‍👧‍👦", text: "Family-friendly seating areas" },
];

const experiences = [
	{
		icon: "🍜",
		title: "Food Court - Especially Yummy Noodles 😋",
		description:
			"Enjoy freshly handmade noodles prepared to order in flagship lounges.",
		gradient: "from-emerald-50 to-teal-50",
		image: "/images/lounges/noodle_bar.jpg",
	},
	{
		icon: "💆🏻‍♂️",
		title: "Massage Room",
		description:
			"Relax with curated teas and serene seating for a calming pre-flight experience.",
		gradient: "from-teal-50 to-cyan-50",
		image: "/images/lounges/massage.jpg",
	},
	{
		icon: "🛏️",
		title: 'Wellness Suites - "The Retreat"',
		description:
			"Dedicated spaces designed to help you unwind and recharge.",
		gradient: "from-emerald-50 to-teal-50",
		image: "/images/lounges/retreat.jpg",
	},
];

export default function LoungesPage() {
	return (
		<main className="min-h-screen bg-white">
			{/* Header */}
			<header className="bg-gradient-to-b from-teal-50 to-white">
				<div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#004b47]">
						Cathay&apos;s Lounges
					</h1>
					<p className="mt-3 text-gray-700 max-w-2xl">
						Experience Cathay Pacific’s premium lounges, designed
						for comfort and convenience. Explore world-class
						amenities and services, available in select cities
						worldwide.
					</p>
				</div>
			</header>

			<div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
				{/* Amenities Grid */}
				<section>
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Services & Amenities
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{amenities.map((item, i) => (
							<div
								key={i}
								className="flex items-center gap-3 bg-white rounded-xl ring-1 ring-gray-200 p-3"
							>
								<span className="text-xl">{item.icon}</span>
								<span className="text-sm text-gray-700">
									{item.text}
								</span>
							</div>
						))}
					</div>
					<p className="mt-3 text-xs text-gray-500">
						Amenities and services may vary by lounge location.
						Availability is subject to change without notice.
					</p>
				</section>

				{/* Locations */}
				<section>
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Lounge Locations
					</h2>
					<div className="bg-white rounded-2xl ring-1 ring-gray-200 divide-y divide-gray-200 overflow-hidden">
						{lounges.map((lounge) => (
							<div
								key={lounge.name}
								className="flex items-center justify-between px-4 py-3"
							>
								<span className="font-semibold text-gray-900">
									{lounge.name}
								</span>
								<Link
									href={lounge.href}
									className={`inline-flex items-center gap-1.5 rounded-full ${
										lounge.open
											? "bg-[#0fa39a] text-white"
											: "bg-gray-300 text-gray-600"
									} text-xs font-medium px-3 py-1.5 hover:${
										lounge.open
											? "bg-[#0c8a83]"
											: "bg-gray-400"
									} transition`}
								>
									{lounge.open ? "Details" : "Closed"}
									<svg
										className="w-3.5 h-3.5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</Link>
							</div>
						))}
					</div>
				</section>

				{/* Featured Experiences */}
				<section>
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Featured Experiences
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{experiences.map((exp, i) => (
							<div
								key={i}
								className="bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden hover:ring-gray-300 transition"
							>
								<div
									className={`h-30 bg-gradient-to-br ${exp.gradient} flex items-center pl-4 relative overflow-hidden`}
								>
									{/* Background image */}
									{exp.image && (
										<div className="absolute inset-0">
											<Image
												src={exp.image}
												alt=""
												fill
												className="object-cover"
												sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
											/>
										</div>
									)}

									{/* Overlay */}
									<div className="absolute inset-0 opacity-30 bg-[radial-gradient(120px_80px_at_20%_20%,#0fa39a18,transparent_60%)]" />

									{/* Icon */}
									<div className="w-12 h-12 rounded-full bg-[#0fa39948] shadow-sm ring-1 ring-black/5 backdrop-blur flex items-center justify-center relative z-10">
										<span className="text-2xl">
											{exp.icon}
										</span>
									</div>
								</div>
								<div className="p-4">
									<h3 className="font-semibold text-gray-900 text-sm">
										{exp.title}
									</h3>
									<p className="mt-1 text-xs text-gray-600">
										{exp.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Access Info */}
				<section>
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Access Information
					</h2>
					<div className="bg-white rounded-2xl ring-1 ring-gray-200 p-5">
						<ul className="space-y-2 text-sm text-gray-700">
							<li>
								• Lounge access is determined by cabin class,
								frequent flyer status or airline partnerships.
							</li>
							<li>• Hours and facilities vary by location.</li>
							<li>
								• Contact your airline for assistance with
								special needs.
							</li>
						</ul>
						<p className="mt-3 text-xs text-gray-500">
							This is a community-built, non-official page. Verify
							all details with official sources before travel.
						</p>
					</div>
				</section>

				{/* CTAs */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
					<Link
						href="/lounges/list"
						className="group bg-white rounded-2xl ring-1 ring-gray-200 p-5 hover:ring-gray-300 transition block"
					>
						<h3 className="font-semibold text-gray-900">
							Browse All Lounges
						</h3>
						<p className="text-sm text-gray-600 mt-1">
							Explore facilities, photos and traveler tips by
							location.
						</p>
						<span className="inline-flex items-center gap-1.5 text-sm text-[#0fa39a] font-medium mt-3 group-hover:gap-2.5 transition-all">
							Browse lounges
							<svg
								className="w-4 h-4"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</span>
					</Link>
					<Link
						href="/contribute"
						className="group bg-white rounded-2xl ring-1 ring-gray-200 p-5 hover:ring-gray-300 transition block"
					>
						<h3 className="font-semibold text-gray-900">
							Share Updates
						</h3>
						<p className="text-sm text-gray-600 mt-1">
							Help us keep this resource accurate and up-to-date.
						</p>
						<span className="inline-flex items-center gap-1.5 text-sm text-[#0fa39a] font-medium mt-3 group-hover:gap-2.5 transition-all">
							Contribute
							<svg
								className="w-4 h-4"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</span>
					</Link>
				</div>

				{/* Footer */}
				<p className="text-xs text-gray-500 text-center py-4">
					This is a non-official resource. All trademarks belong to
					their respective owners. Please verify details with official
					sources before travel.
				</p>
			</div>
		</main>
	);
}
