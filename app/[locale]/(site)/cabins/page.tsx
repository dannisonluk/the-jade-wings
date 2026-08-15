"use client";

import React from "react";
import Image from "next/image";
import Link from "@/components/i18n/LocalizedLink";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type Tone =
	| "aria-noble"
	| "first-noble"
	| "first-elegant"
	| "business-elegant"
	| "prem-econ-formal"
	| "econ-formal";

function CabinCard({
	title,
	subtitle,
	tone,
	badge,
	children,
}: {
	title: string;
	subtitle?: string;
	tone: Tone;
	badge?: string;
	children?: React.ReactNode;
}) {
	const toneClasses: Record<Tone, string> = {
		"aria-noble":
			"relative overflow-hidden rounded-xl p-4 sm:p-5 text-white " +
			"bg-gradient-to-b from-[#033c38] via-[#0a5953] to-[#0a4e49] " +
			"shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_20px_40px_-20px_rgba(3,60,56,0.6)] " +
			"before:absolute before:inset-0 before:content-[''] before:pointer-events-none " +
			"before:bg-[radial-gradient(120%_140%_at_10%_0%,rgba(193,163,106,0.18),transparent_40%)]",
		"first-noble":
			"relative overflow-hidden rounded-xl p-4 sm:p-5 text-rose-50 " +
			"bg-gradient-to-b from-[#3a0f14] via-[#2a0e12] to-[#220c10] " +
			"shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_20px_40px_-20px_rgba(58,15,20,0.6)] " +
			"before:absolute before:inset-0 before:content-[''] before:pointer-events-none " +
			"before:bg-[radial-gradient(120%_140%_at_12%_0%,rgba(255,220,150,0.14),transparent_45%)]",
		"first-elegant":
			"rounded-xl p-4 sm:p-5 bg-gradient-to-br from-[#fcfaf8] via-[#f6efea] to-white text-rose-900/90 " +
			"ring-1 ring-inset ring-[rgba(124,29,36,0.18)] " +
			"shadow-[inset_0_0_0_1px_rgba(124,29,36,0.12),0_14px_30px_-18px_rgba(124,29,36,0.25)]",
		"business-elegant":
			"rounded-xl p-4 sm:p-5 bg-gradient-to-b from-teal-50 via-teal-50 to-slate-50 text-teal-900/90 " +
			"ring-1 ring-inset ring-teal-200/60 shadow-[0_12px_26px_-18px_rgba(0,75,71,0.25)]",
		"prem-econ-formal":
			"rounded-xl p-4 sm:p-5 bg-gradient-to-b from-slate-50 via-slate-100 to-white text-slate-800 " +
			"ring-1 ring-inset ring-slate-300/70 shadow-[0_10px_24px_-18px_rgba(32,41,56,0.25)]",
		"econ-formal":
			"rounded-xl p-4 sm:p-5 bg-gradient-to-b from-gray-50 via-white to-white text-gray-800 " +
			"ring-1 ring-inset ring-gray-200 shadow-[0_8px_20px_-18px_rgba(17,24,39,0.18)]",
	};

	return (
		<article className={toneClasses[tone]}>
			<header className="mb-3 flex items-start justify-between">
				<div>
					<h2
						className={[
							"text-xl font-bold tracking-tight sm:text-2xl",
							tone === "aria-noble" ? "text-white" : "",
							tone === "first-noble" ? "text-rose-50" : "",
							tone === "first-elegant" ? "text-[#5e0f14]" : "",
							tone === "business-elegant" ? "text-[#0d615c]" : "",
							tone === "prem-econ-formal" ? "text-[#2f3b4a]" : "",
							tone === "econ-formal" ? "text-gray-800" : "",
						].join(" ")}
					>
						{title}
					</h2>
					{subtitle ? (
						<p
							className={[
								"mt-1 text-xs font-medium",
								tone === "aria-noble"
									? "text-amber-100/80"
									: "",
								tone === "first-noble"
									? "text-amber-100/80"
									: "",
								tone === "first-elegant"
									? "text-[#8e6a3f]"
									: "",
								tone === "business-elegant"
									? "text-teal-700"
									: "",
								tone === "prem-econ-formal"
									? "text-slate-500"
									: "",
								tone === "econ-formal" ? "text-slate-600" : "",
							].join(" ")}
						>
							{subtitle}
						</p>
					) : null}
				</div>
				{badge ? (
					<span className="ml-3 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
						{badge}
					</span>
				) : null}
			</header>
			{children}
		</article>
	);
}

function AriaCarousel({
	images,
	interval = 5000,
}: {
	images: { src: string; alt: string }[];
	interval?: number;
}) {
	const [index, setIndex] = React.useState(0);
	const count = images.length;

	const go = React.useCallback(
		(dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
		[count]
	);

	React.useEffect(() => {
		const id = setInterval(() => go(1), interval);
		return () => clearInterval(id);
	}, [go, interval]);

	const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.key === "ArrowLeft") go(-1);
		if (e.key === "ArrowRight") go(1);
	};

	return (
		<div
			className="relative aspect-[16/9] overflow-hidden rounded-lg ring-1 ring-inset ring-white/20"
			tabIndex={0}
			onKeyDown={onKeyDown}
		>
			<div className="h-full w-full relative">
				{images.map((img, i) => (
					<div
						key={img.src}
						className={[
							"absolute inset-0 transition-opacity duration-500 ease-out",
							i === index ? "opacity-100" : "opacity-0",
						].join(" ")}
					>
						<Image
							src={img.src}
							alt={img.alt}
							fill
							priority={i === 0}
							sizes="(max-width: 640px) 100vw, 640px"
							className="object-cover"
						/>
					</div>
				))}
			</div>

			<button
				type="button"
				aria-label="Previous"
				className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 active:bg-black/50"
				onClick={() => go(-1)}
			>
				‹
			</button>
			<button
				type="button"
				aria-label="Next"
				className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 active:bg-black/50"
				onClick={() => go(1)}
			>
				›
			</button>

			<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
				{images.map((_, i) => (
					<button
						key={i}
						aria-label={`Go to slide ${i + 1}`}
						className={[
							"h-1.5 w-5 rounded-full transition-all",
							i === index
								? "bg-white/90 w-7"
								: "bg-white/40 hover:bg-white/60",
						].join(" ")}
						onClick={() => setIndex(i)}
					/>
				))}
			</div>
		</div>
	);
}

/* --------------- Business tabs (777 / 330 / 321) ---------------- */

type BizTab = "777" | "330" | "321";

const businessData: Record<
	BizTab,
	{
		name: string;
		images: { src: string; alt: string }[];
		features: string[];
		signature: { title: string; blurb: string };
		aircraft: string[];
		exploreHref: string;
		seatmapImage?: string;
		panelBg?: string; // optional per-tab hue
		chipBg?: string;
	}
> = {
	"777": {
		name: "777 Business",
		images: [
			{
				src: "/images/cabin/business/777/hero.jpg",
				alt: "777 Business cabin",
			},
		],
		features: [
			"All‑aisle access (1‑2‑1)",
			'18–20" screen with AC/USB power',
			"Ample surface and storage",
		],
		signature: {
			title: "Long‑haul comfort",
			blurb: "Spacious layout suited for overnight routes.",
		},
		aircraft: ["777-300ER"],
		exploreHref: "https://www.cathaypacific.com/",
		seatmapImage: "/images/seatmaps/business-77w.png",
		panelBg: "bg-[linear-gradient(180deg,#0a4e49,rgba(8,59,55,0.94))]",
		chipBg: "bg-emerald-400/20",
	},
	"330": {
		name: "A330 Business",
		images: [
			{
				src: "/images/cabin/business/330/hero.jpg",
				alt: "A330 Business cabin",
			},
		],
		features: [
			"Regional configuration",
			"Large pitch and width",
			"Quick-turn ergonomic design",
		],
		signature: {
			title: "Optimized for regional routes",
			blurb: "Efficient comfort and service.",
		},
		aircraft: ["A330-300"],
		exploreHref: "https://www.cathaypacific.com/",
		seatmapImage: "/images/seatmaps/business-a330.png",
		panelBg: "bg-[linear-gradient(180deg,#0a4a5e,rgba(6,48,63,0.94))]",
		chipBg: "bg-cyan-400/20",
	},
	"321": {
		name: "A321neo Business",
		images: [
			{
				src: "/images/cabin/business/321/hero.jpg",
				alt: "A321neo Business cabin",
			},
		],
		features: [
			"Modern narrow‑body cabin",
			"USB power and device stowage",
			"Quiet NEO engines",
		],
		signature: {
			title: "Short‑haul smart",
			blurb: "Compact, refined and efficient.",
		},
		aircraft: ["A321neo"],
		exploreHref: "https://www.cathaypacific.com/",
		seatmapImage: "/images/seatmaps/business-a321.png",
		panelBg: "bg-[linear-gradient(180deg,#0a3f4e,rgba(5,42,53,0.94))]",
		chipBg: "bg-teal-400/20",
	},
};

function BusinessTabs() {
	const [tab, setTab] = React.useState<BizTab>("777");
	const v = businessData[tab];

	return (
		<div className="space-y-3">
			{/* Tabs */}
			<div className="flex flex-wrap gap-2">
				{(["777", "330", "321"] as BizTab[]).map((t) => {
					const selected = t === tab;
					return (
						<button
							key={t}
							onClick={() => setTab(t)}
							className={[
								"inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors",
								selected
									? "bg-white/12 text-white ring-white/25"
									: "bg-white/6 text-white/85 hover:bg-white/10 ring-white/15",
								businessData[t].chipBg ?? "",
							].join(" ")}
						>
							{t}
						</button>
					);
				})}
			</div>

			{/* Content */}
			<div className="grid gap-4 sm:grid-cols-5">
				{/* Media */}
				<div className="sm:col-span-3">
					<div className="relative aspect-[16/9] overflow-hidden rounded-lg ring-1 ring-inset ring-white/15">
						<Image
							src={v.images[0].src}
							alt={v.images[0].alt}
							fill
							sizes="(max-width: 640px) 100vw, 640px"
							className="object-cover"
							priority
						/>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent mix-blend-overlay" />
					</div>
				</div>

				{/* Right column (inverted glass like First) */}
				<div className="sm:col-span-2">
					<div
						className={[
							"relative overflow-hidden rounded-xl p-3 sm:p-4 text-teal-50 ring-1 ring-inset ring-white/10",
							v.panelBg ??
								"bg-[linear-gradient(180deg,#0a4e49,rgba(8,59,55,0.94))]",
						].join(" ")}
					>
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(255,255,255,0.06),transparent_40%)]" />

						{/* Features */}
						<ul className="relative space-y-2.5">
							{v.features.map((t, i) => (
								<li
									key={i}
									className="flex items-center gap-3 rounded-md bg-white/5 px-3 py-2 ring-1 ring-inset ring-white/10 backdrop-blur-sm"
								>
									<span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-300/20 text-emerald-100 ring-1 ring-inset ring-emerald-200/40">
										<svg
											viewBox="0 0 20 20"
											className="h-3.5 w-3.5"
											aria-hidden="true"
										>
											<path
												fill="currentColor"
												d="M7.6 13.6 4.3 10.3l1.4-1.4 1.9 1.9 6-6 1.4 1.4-7.4 7.4z"
											/>
										</svg>
									</span>
									<p className="text-sm text-teal-50/95">
										{t}
									</p>
								</li>
							))}
						</ul>

						{/* Signature */}
						<div className="relative mt-3 rounded-lg bg-emerald-900/35 p-3 ring-1 ring-inset ring-emerald-700/50 backdrop-blur-sm">
							<div className="flex items-start gap-3">
								<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-300/25 text-emerald-50 ring-1 ring-inset ring-emerald-200/50">
									✦
								</span>
								<div>
									<p className="text-sm font-semibold text-teal-50">
										{v.signature.title}
									</p>
									<p className="mt-0.5 text-xs text-teal-100/80">
										{v.signature.blurb}
									</p>
								</div>
							</div>
						</div>

						{/* Availability */}
						<div className="mt-3 rounded-lg bg-white/7 p-3 ring-1 ring-inset ring-white/12 backdrop-blur-sm">
							<p className="text-xs text-white/80">
								Aircraft: {v.aircraft.join(", ")}. Availability
								varies by route. Confirm during seat selection.
							</p>
						</div>

						{/* CTAs */}
						<div className="mt-3 flex flex-wrap gap-2">
							<Link
								href={v.exploreHref}
								target="_blank"
								rel="noopener noreferrer"
							>
								<button className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-white/15 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-300/60">
									Explore {v.name.split(" ")[0]}
								</button>
							</Link>

							{v.seatmapImage ? (
								<Dialog>
									<DialogTrigger asChild>
										<button className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-white/15 hover:bg-white/15">
											Seat map
										</button>
									</DialogTrigger>
									<DialogContent className="max-w-[92vw] sm:max-w-[560px] md:max-w-[680px] p-4 sm:p-6">
										<DialogHeader className="text-left">
											<DialogTitle className="text-white">
												Seat map · {v.name}
											</DialogTitle>
										</DialogHeader>
										<div className="overflow-hidden rounded-lg ring-1 ring-inset ring-white/15 bg-white">
											<div className="relative max-h-[70vh] w-full overflow-auto">
												<Image
													src={v.seatmapImage}
													alt={`${v.name} seat map`}
													width={1500}
													height={2200}
													className="h-auto w-full"
													priority
												/>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ---------------- Page ---------------- */

export default function CabinsPage() {
	return (
		<main className="min-h-screen bg-white text-gray-900 selection:bg-teal-200/60">
			<header className="bg-gradient-to-b from-teal-50 to-white">
				<div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 sm:py-14">
					<h1 className="text-3xl font-extrabold tracking-tight text-[#004b47] sm:text-4xl">
						Cabins in the Sky
					</h1>
					<p className="mt-3 text-gray-600">
						Experience comfort, care and exceptional service for
						every passenger. Explore thoughtfully designed spaces
						tailored to enhance your journey.
					</p>
				</div>
			</header>

			<section className="mx-auto max-w-4xl space-y-8 px-4 py-4 sm:space-y-10 sm:px-6 sm:py-12">
				{/* Aria Suite — its own standalone card */}
				<CabinCard
					title="Aria Suite | Business Class"
					subtitle="Available on 777-300ER · Progressively renovating"
					badge="New"
					tone="aria-noble"
				>
					<AriaCarousel
						images={[
							{
								src: "/images/cabin/business/aria-suite/aria-suite-1.webp",
								alt: "Aria Suite cabin overview",
							},
							{
								src: "/images/cabin/business/aria-suite/aria-suite-pair.jpeg",
								alt: "Aria pair",
							},
							{
								src: "/images/cabin/business/aria-suite/aria-suite-sleep.jpeg",
								alt: "Aria Suite sleep",
							},
							{
								src: "/images/cabin/business/aria-suite/aria-suite-display.jpg",
								alt: "Aria Suite display",
							},
						]}
						interval={5000}
					/>

					{/* Aria content panel (inverted glass) */}
					<div className="mt-4 rounded-2xl bg-white/0">
						<div className="relative overflow-hidden rounded-xl bg-[linear-gradient(180deg,#0a4e49,rgba(8,59,55,0.94))] p-3 sm:p-4 text-teal-50 ring-1 ring-inset ring-white/10">
							<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(255,255,255,0.06),transparent_40%)]" />

							<ul className="relative space-y-2.5">
								{[
									"Privacy and luxurious comfort",
									"Immersive 24-inch 4K display",
									"Bluetooth audio and wireless charging",
									"All-in-one fingertip seat control",
								].map((text, i) => (
									<li
										key={i}
										className="flex items-center gap-3 rounded-md bg-white/5 px-3 py-2 ring-1 ring-inset ring-white/10 backdrop-blur-sm"
									>
										<span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-300/20 text-emerald-100 ring-1 ring-inset ring-emerald-200/40">
											<svg
												viewBox="0 0 20 20"
												aria-hidden="true"
												className="h-3.5 w-3.5"
											>
												<path
													fill="currentColor"
													d="M7.6 13.6 4.3 10.3l1.4-1.4 1.9 1.9 6-6 1.4 1.4-7.4 7.4z"
												/>
											</svg>
										</span>
										<p className="text-sm text-teal-50/95">
											{text}
										</p>
									</li>
								))}
							</ul>

							<div className="relative mt-3 rounded-lg bg-emerald-900/35 p-3 ring-1 ring-inset ring-emerald-700/50 backdrop-blur-sm">
								<div className="flex items-start gap-3">
									<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-300/25 text-emerald-50 ring-1 ring-inset ring-emerald-200/50">
										✦
									</span>
									<div>
										<p className="text-sm font-semibold text-teal-50">
											New Generation | State‑of‑the‑Art
										</p>
										<p className="mt-0.5 text-xs text-teal-100/80">
											Refined craftsmanship with
											thoughtful technology.
										</p>
									</div>
								</div>
							</div>

							<div className="mt-3 flex flex-wrap gap-2">
								<Link
									href="https://flights.cathaypacific.com/en_HK/flying-with-us/cabin-classes/business-class/the-aria-suite.html"
									target="_blank"
									rel="noopener noreferrer"
								>
									<button className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-white/15 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-300/60">
										Explore Aria Suite
									</button>
								</Link>
							</div>
						</div>
					</div>
				</CabinCard>

				{/* Business Class — separate from Aria, with tabs 777 / 330 / 321 */}
				<CabinCard
					title="Business Class"
					subtitle="Different products by aircraft · Choose 777 / 330 / 321"
					tone="aria-noble"
					badge="Updated"
				>
					<BusinessTabs />
				</CabinCard>

				{/* First Class — unchanged */}
				<CabinCard
					title="First Class"
					subtitle="Available on 777-300ER"
					tone="first-noble"
				>
					<div className="grid gap-4 sm:grid-cols-5">
						<div className="sm:col-span-3">
							<div className="relative aspect-[16/9] overflow-hidden rounded-lg ring-1 ring-inset ring-rose-200/40">
								<Image
									src="/images/cabin/first/sitting.jpg"
									alt="Cathay Pacific First Class suite"
									fill
									sizes="(max-width: 640px) 100vw, 640px"
									className="object-cover"
									priority
								/>
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent mix-blend-overlay" />
							</div>
						</div>

						<div className="sm:col-span-2">
							<div className="relative overflow-hidden rounded-xl bg-[linear-gradient(180deg,#2a0e12,rgba(42,14,18,0.94))] p-3 sm:p-4 text-rose-50 ring-1 ring-inset ring-rose-900/40">
								<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(255,255,255,0.06),transparent_40%)]" />
								<ul className="relative space-y-2.5">
									{[
										"Private and spacious suite room",
										'Dedicated and "softest" chaise lounge',
										"Access to Cathay's First-Class lounge",
									].map((t, i) => (
										<li
											key={i}
											className="flex items-center gap-3 rounded-md bg-white/5 px-3 py-2 ring-1 ring-inset ring-white/10 backdrop-blur-sm"
										>
											<span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-300/20 text-rose-100 ring-1 ring-inset ring-rose-200/40">
												<svg
													viewBox="0 0 20 20"
													className="h-3.5 w-3.5"
													aria-hidden="true"
												>
													<path
														fill="currentColor"
														d="M7.6 13.6 4.3 10.3l1.4-1.4 1.9 1.9 6-6 1.4 1.4-7.4 7.4z"
													/>
												</svg>
											</span>
											<p className="text-sm text-rose-50/95">
												{t}
											</p>
										</li>
									))}
								</ul>

								<div className="relative mt-3 rounded-lg bg-rose-900/40 p-3 ring-1 ring-inset ring-rose-700/50 backdrop-blur-sm">
									<div className="flex items-start gap-3">
										<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-300/25 text-amber-100 ring-1 ring-inset ring-amber-200/50">
											✦
										</span>
										<div>
											<p className="text-sm font-semibold text-rose-50">
												Signature First dining
											</p>
											<p className="mt-0.5 text-xs text-rose-100/80">
												Restaurant-quality menus and
												curated wine list.
											</p>
										</div>
									</div>
								</div>

								<div className="mt-3 flex flex-wrap gap-2">
									<Link href="https://flights.cathaypacific.com/en_HK/flying-with-us/cabin-classes/first-class.html">
										<button className="rounded-md bg-[#5e0f14] px-3 py-2 text-xs font-semibold text-white shadow hover:bg-[#4d0c11] focus:outline-none focus:ring-2 focus:ring-rose-300/60">
											Explore First
										</button>
									</Link>

									<Dialog>
										<DialogTrigger asChild>
											<button className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-rose-50 ring-1 ring-inset ring-white/15 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-rose-300/60">
												Seat map
											</button>
										</DialogTrigger>

										<DialogContent className="max-w-[92vw] sm:max-w-[520px] md:max-w-[640px] p-4 sm:p-6 z-[1000000001] gap-2">
											<DialogHeader className="text-left">
												<DialogTitle className="text-[#5e0f14]">
													First Class Seat‑map
												</DialogTitle>
											</DialogHeader>

											<div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-inset ring-amber-200">
												<p className="font-semibold">
													Recommendation
												</p>
												<ul className="mt-1 list-disc pl-5">
													<li>
														Seat A: Best for single
														travellers
													</li>
													<li>
														Seats D & K: Best for
														pair travellers
													</li>
												</ul>
											</div>

											<div className="overflow-hidden rounded-lg ring-1 ring-inset ring-rose-200/50">
												<div className="relative max-h-[70vh] w-full overflow-auto bg-white">
													<div className="group relative mx-auto w-[900px] max-w-full">
														<Image
															src="/images/cabin/first/seating-recommendation.png"
															alt="Cathay Pacific 777-300ER First Class seat map"
															width={1500}
															height={2200}
															className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.025]"
															priority
														/>
													</div>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</div>
						</div>
					</div>
				</CabinCard>
			</section>
		</main>
	);
}
