// app/lounge/page.tsx
import Image from "next/image";
import Link from "@/components/i18n/LocalizedLink";

export const metadata = {
	title: "Lounges | Services & Amenities",
	description:
		"Discover Cathay-style lounge services and amenities. A non-official, community-built resource for travelers.",
};

const experiences = [
	{
		icon: "🍜",
		title: "Culinary - Especially Yummy Noodles 😋",
		description:
			"Enjoy decent culinary prepared to order in flagship lounges.",
		gradient: "from-emerald-50 to-teal-50",
		image: "/images/lounges/food_bar.jpg",
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
				<div className="max-w-5xl mx-auto px-4 pt-6 sm:py-12">
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

			<div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
				{/* Featured Experiences */}
				<section>
					<h2 className="text-lg font-semibold text-gray-900 mb-1">
						Featured Experiences
					</h2>
					<div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-md p-3 mb-3 shadow-sm">
						<span>✨ Experiences may vary by lounge location.</span>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{experiences.map((exp, i) => (
							<div
								key={i}
								className="bg-white rounded-2xl ring-1 ring-gray-400 overflow-hidden hover:ring-gray-300 transition"
							>
								<div
									className={`h-36 bg-gradient-to-br ${exp.gradient} flex items-center pl-4 relative overflow-hidden`}
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
								<div className="p-5">
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

				{/* Lounge Location */}
				<section className="mt-8">
					<h2 className="text-lg font-semibold text-gray-900 mb-2">
						Lounge Location
					</h2>
					<div className=" mb-2 bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-md p-3 mt-3 shadow-sm">
						<span>
							<span className="font-bold">
								Click and explore the 2 categories
							</span>{" "}
							below to learn more about Cathay&apos;s exclusive
							lounges.
						</span>
					</div>
					<div className="flex flex-col sm:flex-row bg-white rounded-2xl ring-1 ring-gray-200 overflow-hidden">
						{/* HKIA Side */}
						<Link href="/lounges/hk">
							<div className="flex-1 relative group">
								{/* Image */}
								<div className="relative w-full h-48 sm:h-64">
									<Image
										src="/images/lounges/hkia.jpg" // Replace with your HKIA image path
										alt="HKIA"
										fill
										className="object-cover"
									/>
								</div>
								{/* Text Overlay */}
								<div className="absolute inset-x-0 bottom-0 bg-[#004b47]/80 text-white text-center py-4">
									<h3 className="text-lg font-semibold">
										Hong Kong International Airport
									</h3>
									<p className="text-sm">
										The Pier | The Deck | The Wing | The
										Bridge
									</p>
								</div>
							</div>
						</Link>
						{/* Other Cathay Operated Side */}
						{/* <Link href="/lounges/worldwide"> */}
						<Link href="/lounges/worldwide">
							<div className="flex-1 relative group">
								{/* Image */}
								<div className="relative w-full h-48 sm:h-64">
									<Image
										src="/images/lounges/heathrow.jpg" // Replace with your "Other Cathay Operated" image path
										alt="Other Cathay Operated"
										fill
										className="object-cover"
									/>
								</div>
								{/* Text Overlay */}
								<div className="absolute inset-x-0 bottom-0 bg-[#004b47]/80 text-white text-center py-4">
									<h3 className="text-lg font-semibold">
										Other Cathay Operated
									</h3>
									<p className="text-sm">
										Premium lounges in Cathay-connected
										major cities
									</p>
								</div>
							</div>
						</Link>
					</div>
					<div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 text-sm rounded-md p-3 mt-3 shadow-sm">
						<Link href="https://www.cathaypacific.com/cx/en_HK/destinations/lounges/worldwide-lounges.html">
							<span>
								Discover more lounges worldwide in collaboration
								with Cathay Pacific. Click{" "}
								<span className="font-bold">here</span> to learn
								more.
							</span>
						</Link>
					</div>
				</section>

				{/* Miscellaneous */}
				<section>
					<h2 className="text-lg font-semibold text-gray-900 mb-3">
						Miscellaneous
					</h2>
					<div className="bg-white rounded-2xl ring-1 ring-gray-400 p-5">
						<ul className="space-y-4 text-sm text-gray-700">
							<div>
								<p>
									<span className="font-bold">
										Lounge access
									</span>{" "}
									is determined by various factors such as
									ticket class, frequent flyer status and
									alliances.
								</p>
								<p className="mt-1 text-xs inline-flex gap-1 text-[#0fa39a] font-medium">
									<Link href="https://www.cathaypacific.com/cx/en_HK/destinations/lounges/all-lounges-admittance.html">
										Click here to lounge admittance details
									</Link>
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
								</p>
							</div>

							<div>
								<p>
									<span className="font-bold">
										Hours and facilities
									</span>{" "}
									vary by location.
								</p>
								<p className="mt-1 text-xs inline-flex gap-1 text-[#0fa39a] font-medium">
									<Link href="https://www.cathaypacific.com/cx/en_HK/destinations/lounges/worldwide-lounges.html">
										Click here to verify with official
										lounge information
									</Link>
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
								</p>
							</div>

							<div>
								<p>
									Respect the{" "}
									<span className="font-bold">
										Lounge Etiquette
									</span>
								</p>
								<p className="mt-1 text-xs inline-flex gap-1 text-[#0fa39a] font-medium">
									<Link href="https://www.cathaypacific.com/cx/en_HK/destinations/lounges/lounge-etiquette.html">
										Click here to learn more from official
										website
									</Link>
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
								</p>
							</div>
						</ul>
					</div>
				</section>
			</div>
		</main>
	);
}
