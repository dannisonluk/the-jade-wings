"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Lounge = {
	title: string;
	subtitle: string;
	image: string;
	alt: string;
	link: string;
};

const CHINA_LOUNGE: Lounge[] = [
	{
		title: "Beijing",
		subtitle: "Beijing Capital International Airport",
		image: "https://www.executivetraveller.com/photos/view/size:1200,675/68a3dfbe949047c091ce37d0dd799465-cathay-pacific-beijing-lounge-review-5.jpg",
		alt: "Beijing Capital International Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/beijing-pek/cathay-pacific-lounge.html",
	},
	{
		title: "Shanghai",
		subtitle: "Shanghai Pudong International Airport",
		image: "https://www.verylvke.com/wp-content/uploads/sites/2/2025/06/pvg-t2-cathay-pacific-lounge-1.jpg",
		alt: "Shanghai Pudong International Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/shanghai-pvg/cathay-pacific-lounge.html",
	},
	{
		title: "Shenzhen",
		subtitle: "Shekou Cruise Home Port",
		image: "https://www.swirepacific.com/storage/fm/press/press_release_image_en/p240119a.jpg",
		alt: "Shekou Cruise Home Port",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/shenzhen-zyk/cathay-pacific-lounge.html",
	},
];

const NORTHEAST_ASIA_LOUNGE: Lounge[] = [
	{
		title: "Haneda, Tokyo",
		subtitle: "Tokyo International Airport",
		image: "https://www.flyformiles.hk/wp-content/uploads/2023/04/IMG_8046.jpg",
		alt: "Tokyo International Airport (Haneda Airport)",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/tokyo-hnd/cathay-pacific-lounge.html",
	},
	{
		title: "Narita, Tokyo",
		subtitle: "Temporarily Closed for Renovation",
		image: "https://cdn.jakartapotato.com/CathayPacificLoungeNarita/B_Seating1.jpg",
		alt: "New Tokyo International Airport (Narita Airport)",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/tokyo-nrt/cathay-pacific-lounge.html",
	},
	{
		title: "Taipei",
		subtitle: "Taiwan Taoyuan International Airport",
		image: "https://images.squarespace-cdn.com/content/v1/52ccee75e4b00bc0dba03f46/ea76a3b5-1b7c-4f5b-95ba-f220ab64d33c/Cathay+Pacific+Lounge+TPE+Taipei+Taoyuan+Review-6.jpg",
		alt: "Taiwan Taoyuan International Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/taipei-tpe/cathay-pacific-lounge.html",
	},
];

const SOUTHEAST_ASIA_LOUNGE: Lounge[] = [
	{
		title: "Singapore",
		subtitle: "Singapore Changi Airport",
		image: "https://cdn.businesstraveller.com/wp-content/uploads/2019/02/IMG_2060.jpg",
		alt: "Singapore Changi Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/singapore-sin/cathay-pacific-lounge.html",
	},
	{
		title: "Bangkok",
		subtitle: "Suvarnabhumi International Airport",
		image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhkqQvPHEdIgQs5ONOjIqYdZNpGIxg7zpu_Rpz6fYuwl4d3C7Xn79D4ZQK1pjHXsvS1NwpjYgFkP3guJZWiVGdEgI4KN6nbOPeiu521HF4hLear6FaO2_Pn0EX_Zpya1NVlXi8YLlOEgYc/s1600/DSCN3076.JPG",
		alt: "Suvarnabhumi International Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/bangkok-bkk/cathay-pacific-lounge.html",
	},
	{
		title: "Manila",
		subtitle: "Ninoy Aquino International Airport",
		image: "https://cdn.jakartapotato.com/Cathay%20Pacific%20Lounge%20Manila/Lounge.jpg",
		alt: "Ninoy Aquino International Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/manila-mnl/cathay-pacific-lounge.html",
	},
];

const EUROPE_LOUNGE: Lounge[] = [
	{
		title: "London",
		subtitle: "Heathrow Airport",
		image: "https://i.pointhacks.com/2024/01/12174544/cathay-pacific-first-class-lounge-london-heathrow-1600-1024x576.jpg",
		alt: "Heathrow Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/london-lhr/cathay-pacific-lounge.html",
	},
	{
		title: "Paris",
		subtitle: "Paris Charles de Gaulle Airport",
		image: "https://www.executivetraveller.com/photos/view/size:1200,675/6941d9682938424fad2c4676dd799465-cathay-pacific-paris-cdg-lounge-1.jpg",
		alt: "Paris Charles de Gaulle Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/paris-cdg/cathay-pacific-lounge.html",
	},
];

const AMERICA_LOUNGE: Lounge[] = [
	{
		title: "San Francisco",
		subtitle: "San Francisco International Airport",
		image: "https://cdn.onemileatatime.com/wp-content/uploads/2015/12/Cathay-Pacific-Lounge-San-Francisco-10.jpg",
		alt: "San Francisco International Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/san-francisco-sfo/cathay-pacific-lounge.html",
	},
	{
		title: "Vancouver",
		subtitle: "Vancouver International Airport",
		image: "https://www.travelweek.ca/wp-content/uploads/2016/05/Cathay-Pacific-Vancouver-Lounge-1.jpg",
		alt: "Vancouver International Airport",
		link: "https://www.cathaypacific.com/cx/en_HK/destinations/lounges/vancouver-yvr/cathay-pacific-lounge.html",
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
						Cathay Worldwide
					</h1>
					<p className="mt-3 max-w-2xl text-md text-gray-700">
						Cathay Pacific not only operates lounges at its home
						base in Hong Kong but also manages lounges at several
						key international airports. This ensures a consistent
						and premium experience for its customers worldwide.
					</p>

					{/* Lounges block */}
					<section
						aria-labelledby="lounges-heading"
						className="mt-6 sm:mt-10"
					>
						{/* China Lounges */}
						<>
							<div className="flex items-baseline justify-between">
								<h2 className="text-md font-extrabold tracking-tight text-[#004b47] sm:text-3xl">
									Chinese Mainland (CHN)
								</h2>
							</div>

							{/* Mobile carousel */}
							<ul
								className="mt-1 flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] scroll-px-4 snap-x snap-mandatory sm:hidden"
								aria-label="Hong Kong lounges"
							>
								{CHINA_LOUNGE.map((l) => (
									<LoungeCard
										key={l.link}
										lounge={l}
									/>
								))}
							</ul>

							{/* Grid for >= sm */}
							<ul className="mt-4 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
								{CHINA_LOUNGE.map((l) => (
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

						{/* Northeast Asia Lounges */}
						<>
							<div className="mt-4 flex items-baseline justify-between">
								<h2 className="text-md font-extrabold tracking-tight text-[#004b47] sm:text-3xl">
									Northeast Asia (NEA)
								</h2>
							</div>

							{/* Mobile carousel */}
							<ul
								className="mt-1 flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] scroll-px-4 snap-x snap-mandatory sm:hidden"
								aria-label="Hong Kong lounges"
							>
								{NORTHEAST_ASIA_LOUNGE.map((l) => (
									<LoungeCard
										key={l.link}
										lounge={l}
									/>
								))}
							</ul>

							{/* Grid for >= sm */}
							<ul className="mt-4 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
								{NORTHEAST_ASIA_LOUNGE.map((l) => (
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

						{/* Southeast Asia Lounges */}
						<>
							<div className="mt-4 flex items-baseline justify-between">
								<h2 className="text-md font-extrabold tracking-tight text-[#004b47] sm:text-3xl">
									Southeast Asia (SEA)
								</h2>
							</div>

							{/* Mobile carousel */}
							<ul
								className="mt-1 flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] scroll-px-4 snap-x snap-mandatory sm:hidden"
								aria-label="Hong Kong lounges"
							>
								{SOUTHEAST_ASIA_LOUNGE.map((l) => (
									<LoungeCard
										key={l.link}
										lounge={l}
									/>
								))}
							</ul>

							{/* Grid for >= sm */}
							<ul className="mt-4 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
								{SOUTHEAST_ASIA_LOUNGE.map((l) => (
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

						{/* Europe Lounges */}
						<>
							<div className="mt-4 flex items-baseline justify-between">
								<h2 className="text-md font-extrabold tracking-tight text-[#004b47] sm:text-3xl">
									Europe (EUR)
								</h2>
							</div>

							{/* Mobile carousel */}
							<ul
								className="mt-1 flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] scroll-px-4 snap-x snap-mandatory sm:hidden"
								aria-label="Hong Kong lounges"
							>
								{EUROPE_LOUNGE.map((l) => (
									<LoungeCard
										key={l.link}
										lounge={l}
									/>
								))}
							</ul>

							{/* Grid for >= sm */}
							<ul className="mt-4 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
								{EUROPE_LOUNGE.map((l) => (
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

						{/* America Lounges */}
						<>
							<div className="mt-4 flex items-baseline justify-between">
								<h2 className="text-md font-extrabold tracking-tight text-[#004b47] sm:text-3xl">
									America (TAM)
								</h2>
							</div>

							{/* Mobile carousel */}
							<ul
								className="mt-1 flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] scroll-px-4 snap-x snap-mandatory sm:hidden"
								aria-label="Hong Kong lounges"
							>
								{AMERICA_LOUNGE.map((l) => (
									<LoungeCard
										key={l.link}
										lounge={l}
									/>
								))}
							</ul>

							{/* Grid for >= sm */}
							<ul className="mt-4 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
								{AMERICA_LOUNGE.map((l) => (
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
