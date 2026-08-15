"use client";

import Image from "next/image";
import Link from "@/components/i18n/LocalizedLink";
import { ChevronRight } from "lucide-react";

type Lounge = {
	title: string;
	subtitle: string;
	image: string;
	alt: string;
	link: string;
};

const FIRST_CLASS_LOUNGES: Lounge[] = [
	{
		title: "The Wing | First Class",
		subtitle: "Terminal 1, near gates 1-4",
		image: "/images/lounges/hk/thewing_first.jpg",
		alt: "The Wing | First Class Lounge",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/hong-kong-hkg/the-wing-first.html",
	},
	{
		title: "The Pier | First Class",
		subtitle: "Terminal 1, near gate 63",
		image: "/images/lounges/hk/thepier_first.webp",
		alt: "The Pier | First Class Lounge",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/hong-kong-hkg/the-pier-first.html",
	},
];

const BUSINESS_LOUNGES: Lounge[] = [
	{
		title: "The Wing | Business Class",
		subtitle: "Temporarily Closed for Renovation",
		image: "/images/lounges/hk/thewing_business.webp",
		alt: "The Wing | Business Class Lounge",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/hong-kong-hkg/the-wing.html",
	},
	{
		title: "The Pier | Business Class",
		subtitle: "Terminal 1, near gate 65",
		image: "/images/lounges/hk/thepier_business.jpg",
		alt: "The Pier | Business Class Lounge",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/hong-kong-hkg/the-pier.html",
	},
	{
		title: "The Bridge",
		subtitle: "Terminal 1, near gate 35",
		image: "/images/lounges/hk/thebridge_business.webp",
		alt: "The Bridge | Business Class Lounge",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/hong-kong-hkg/the-bridge.html",
	},
	{
		title: "The Deck",
		subtitle: "Terminal 1, near gate 6",
		image: "/images/lounges/hk/thedeck_business.webp",
		alt: "The Deck | Business Class Lounge",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/hong-kong-hkg/the-deck.html",
	},
];

function LoungeCard({ lounge }: { lounge: Lounge }) {
	return (
		<li className="snap-start shrink-0 w-[88%] xs:w-[80%] sm:w-auto sm:shrink sm:snap-none">
			<Link
				href={lounge.link}
				className="group relative block overflow-hidden bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
			>
				{/* Image container keeps aspect ratio */}
				<div className="relative aspect-[16/10] sm:aspect-[16/9]">
					<Image
						src={lounge.image}
						alt={lounge.alt}
						fill
						sizes="(max-width: 640px) 88vw, (max-width: 768px) 50vw, 33vw"
						priority={false}
						className="object-cover transition-transform duration-500 group-hover:scale-105"
					/>
					{/* Gradient overlay for text readability */}
					<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
					{/* Text overlay */}
					<div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
						<div className="flex items-center gap-2 text-white">
							<h3 className="text-lg font-semibold md:text-xl">
								{lounge.title}
							</h3>
							<ChevronRight
								className="h-4 w-4 translate-x-0 opacity-80 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
								aria-hidden
							/>
						</div>
						<p className="mt-1 text-sm font-medium text-white/90">
							{lounge.subtitle}
						</p>
					</div>
				</div>
			</Link>
		</li>
	);
}

export default function HongKongLoungePage() {
	return (
		<div className="min-h-screen bg-white">
			<div className="bg-gradient-to-b from-teal-50 to-white">
				<div className="mx-auto max-w-5xl px-4 pt-6 sm:py-12 pb-4">
					<h1 className="text-2xl font-extrabold tracking-tight text-[#004b47] sm:text-3xl">
						Cathay at Hong Kong
					</h1>
					<p className="mt-3 max-w-2xl text-md text-gray-700">
						Cathay Pacific operates several decent lounges at Hong
						Kong International Airport and these lounges showcase
						Cathay&apos;s commitment to providing excellent service
						and hospitality.
					</p>

					{/* Lounges block */}
					<section
						aria-labelledby="lounges-heading"
						className="mt-6 sm:mt-10"
					>
						{/* First Class Lounges */}
						<>
							<div className="flex items-baseline justify-between">
								<h2
									id="first-class-heading"
									className="text-xl sm:text-2xl font-semibold tracking-tight text-[#d8c58a]  uppercase"
								>
									First Class
								</h2>
							</div>

							{/* Mobile carousel */}
							<ul
								className="mt-1 flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] scroll-px-4 snap-x snap-mandatory sm:hidden"
								aria-label="Hong Kong lounges"
							>
								{FIRST_CLASS_LOUNGES.map((l) => (
									<LoungeCard
										key={l.link}
										lounge={l}
									/>
								))}
							</ul>

							{/* Grid for >= sm */}
							<ul className="mt-4 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
								{FIRST_CLASS_LOUNGES.map((l) => (
									<li
										key={l.link}
										className="min-w-0"
									>
										<Link
											href={l.link}
											className="group relative block overflow-hidden rounded-xl bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
										>
											<div className="relative aspect-[16/10] lg:aspect-[16/9]">
												<Image
													src={l.image}
													alt={l.alt}
													fill
													sizes="(max-width: 1024px) 50vw, 33vw"
													className="object-cover transition-transform duration-500 group-hover:scale-105"
												/>
												<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
												<div className="absolute inset-x-0 bottom-0 p-4">
													<div className="flex items-center gap-2 text-white">
														<h3 className="text-lg font-semibold">
															{l.title}
														</h3>
														<ChevronRight
															className="h-4 w-4 opacity-80 group-hover:opacity-100"
															aria-hidden
														/>
													</div>
													<p className="mt-1 text-sm font-medium text-white/90">
														{l.subtitle}
													</p>
												</div>
											</div>
										</Link>
									</li>
								))}
							</ul>
						</>

						{/* Business Class Lounges */}
						<>
							<div className="mt-4 flex items-baseline justify-between">
								<h2
									id="lounges-heading"
									className="text-xl sm:text-2xl font-semibold tracking-tight text-[#004b47]  uppercase"
								>
									Business Class
								</h2>
							</div>

							{/* Mobile carousel */}
							<ul
								className="mt-1 flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] scroll-px-4 snap-x snap-mandatory sm:hidden"
								aria-label="Hong Kong lounges"
							>
								{BUSINESS_LOUNGES.map((l) => (
									<LoungeCard
										key={l.link}
										lounge={l}
									/>
								))}
							</ul>

							{/* Grid for >= sm */}
							<ul className="mt-4 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
								{BUSINESS_LOUNGES.map((l) => (
									<li
										key={l.link}
										className="min-w-0"
									>
										<Link
											href={l.link}
											className="group relative block overflow-hidden rounded-xl bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
										>
											<div className="relative aspect-[16/10] lg:aspect-[16/9]">
												<Image
													src={l.image}
													alt={l.alt}
													fill
													sizes="(max-width: 1024px) 50vw, 33vw"
													className="object-cover transition-transform duration-500 group-hover:scale-105"
												/>
												<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
												<div className="absolute inset-x-0 bottom-0 p-4">
													<div className="flex items-center gap-2 text-white">
														<h3 className="text-lg font-semibold">
															{l.title}
														</h3>
														<ChevronRight
															className="h-4 w-4 opacity-80 group-hover:opacity-100"
															aria-hidden
														/>
													</div>
													<p className="mt-1 text-sm font-medium text-white/90">
														{l.subtitle}
													</p>
												</div>
											</div>
										</Link>
									</li>
								))}
							</ul>
						</>
					</section>
				</div>
			</div>
		</div>
	);
}
