"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type Tone =
	| "aria-noble"
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

function ImagePreview({
	src,
	alt,
	priority = false,
}: {
	src: string;
	alt: string;
	priority?: boolean;
}) {
	return (
		<div className="relative aspect-[16/9] overflow-hidden rounded-lg ring-1 ring-inset ring-black/10">
			<Image
				src={src}
				alt={alt}
				fill
				priority={priority}
				sizes="(max-width: 640px) 100vw, 640px"
				className="object-cover"
			/>
		</div>
	);
}

// Placeholder “carousel” using a single next/image slide.
// You can extend this with state and multiple images later.
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
		(dir: 1 | -1) => {
			setIndex((i) => (i + dir + count) % count);
		},
		[count]
	);

	// auto-advance
	React.useEffect(() => {
		const id = setInterval(() => go(1), interval);
		return () => clearInterval(id);
	}, [go, interval]);

	// Pause on hover
	const pauseRef = React.useRef<number | null>(null);
	const onMouseEnter = () => {
		if (pauseRef.current != null) return;
		// Clear the last interval by remounting effect: quick trick is to toggle a key,
		// but simpler: just noop; auto-advance will continue. If you need strict pause:
		// Convert the interval to a manual setTimeout chain. For most cases, this is fine.
	};

	const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.key === "ArrowLeft") go(-1);
		if (e.key === "ArrowRight") go(1);
	};

	return (
		<div
			className="relative aspect-[16/9] overflow-hidden rounded-lg ring-1 ring-inset ring-white/20"
			tabIndex={0}
			onKeyDown={onKeyDown}
			onMouseEnter={onMouseEnter}
		>
			{/* Slides */}
			<div
				className="h-full w-full"
				style={{ position: "relative" }}
			>
				{images.map((img, i) => {
					const isActive = i === index;
					return (
						<div
							key={img.src}
							className={[
								"absolute inset-0 transition-opacity duration-500 ease-out",
								isActive ? "opacity-100" : "opacity-0",
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
					);
				})}
			</div>

			{/* Controls */}
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

			{/* Dots */}
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
				{/* 1. Aria Suite */}
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
								alt: "Aria Suite seat and console detail",
							},
							{
								src: "/images/cabin/business/aria-suite/aria-suite-sleep.jpeg",
								alt: "Aria Suite door and lighting",
							},
							{
								src: "/images/cabin/business/aria-suite/aria-suite-display.jpg",
								alt: "Aria Suite door and lighting",
							},
						]}
						interval={5000}
					/>

					{/* Your Option A list (centered icon) */}
					<ul className="mt-4 space-y-2">
						{[
							"Privacy and luxurious comfort",
							"Immersive 24-inch 4K display",
							"Bluetooth audio and wireless charging",
							"All-in-one fingertip seat control",
						].map((text, i) => (
							<li
								key={i}
								className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/8"
							>
								<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
								<div className="flex items-center gap-3">
									<span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 ring-1 ring-inset ring-emerald-300/30">
										<svg
											viewBox="0 0 20 20"
											aria-hidden="true"
											className="h-3.5 w-3.5 text-emerald-200"
										>
											<path
												fill="currentColor"
												d="M7.6 13.6 4.3 10.3l1.4-1.4 1.9 1.9 6-6 1.4 1.4-7.4 7.4z"
											/>
										</svg>
									</span>
									<p className="flex-1 text-[15px] leading-6 text-white/95">
										{text}
									</p>
								</div>
								<div className="pointer-events-none absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-emerald-300/10 blur-md transition-opacity group-hover:block" />
							</li>
						))}
					</ul>
					{/* CTA: Explore Aria Suite */}
					<div className="mt-4 flex flex-wrap gap-2">
						<Link href="https://flights.cathaypacific.com/en_HK/flying-with-us/cabin-classes/business-class/the-aria-suite.html">
							<button className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur hover:bg-white/15 active:bg-white/20">
								<svg
									viewBox="0 0 20 20"
									aria-hidden="true"
									className="h-3.5 w-3.5 text-emerald-200"
								>
									<path
										fill="currentColor"
										d="M11.3 4.3 16 9l-4.7 4.7-1.4-1.4 2-2H4v-2h7.9l-2-2 1.4-1.4z"
									/>
								</svg>
								Explore Aria Suite
							</button>
						</Link>
					</div>
				</CabinCard>

				{/* 2. First */}
				<CabinCard
					title="First Class"
					subtitle="Available on 777-300ER"
					tone="first-elegant"
				>
					<div className="grid gap-4 sm:grid-cols-5">
						{/* Media */}
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
								{/* Soft top gloss */}
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent mix-blend-overlay" />
							</div>
						</div>

						{/* Content */}
						<div className="sm:col-span-2 flex flex-col">
							<ul className="space-y-2.5">
								{[
									"Private and spacious suite room",
									'Dedicated and "softest" chaise lounge',
									"Access to Cathay's First-Class lounge",
								].map((t, i) => (
									<li
										key={i}
										className="flex items-center gap-3 rounded-md bg-white/70 px-3 py-2 ring-1 ring-inset ring-rose-200/40"
									>
										<span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-[#5e0f14] ring-1 ring-inset ring-rose-200/70">
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
										<p className="text-sm text-rose-950/90">
											{t}
										</p>
									</li>
								))}
							</ul>

							{/* Signature service */}
							<div className="mt-3 rounded-lg bg-gradient-to-br from-[#fff9f3] to-white p-3 ring-1 ring-inset ring-amber-900/10">
								<div className="flex items-start gap-3">
									<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200">
										✦
									</span>
									<div>
										<p className="text-sm font-semibold text-[#5e0f14]">
											Signature First dining
										</p>
										<p className="mt-0.5 text-xs text-rose-900/80">
											Restaurant-quality menus and curated
											wine list.
										</p>
									</div>
								</div>
							</div>

							{/* CTAs */}
							<div className="mt-3 flex flex-wrap gap-2">
								<Link href="https://flights.cathaypacific.com/en_HK/flying-with-us/cabin-classes/first-class.html">
									<button className="rounded-md bg-[#5e0f14] px-3 py-2 text-xs font-semibold text-white shadow hover:bg-[#4d0c11]">
										Explore First
									</button>
								</Link>

								<Dialog>
									<DialogTrigger asChild>
										<button className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-[#5e0f14] ring-1 ring-inset ring-rose-300 hover:bg-rose-50">
											Seat map
										</button>
									</DialogTrigger>

									<DialogContent className="max-w-[92vw] sm:max-w-[520px] md:max-w-[640px] p-4 sm:p-6 z-1000000001 gap-2">
										<DialogHeader className="text-left">
											<DialogTitle className="text-[#5e0f14]">
												First Class Seat-map
											</DialogTitle>
										</DialogHeader>
										{/* Recommendation banner */}
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
													Seats D & K: Best for pair
													travellers
												</li>
											</ul>
										</div>

										{/* Image container with hover zoom on desktop */}
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
				</CabinCard>
			</section>
		</main>
	);
}
