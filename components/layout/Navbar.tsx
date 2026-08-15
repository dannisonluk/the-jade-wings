"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	Bars3Icon,
	XMarkIcon,
	ChevronRightIcon,
	ArrowTopRightOnSquareIcon,
	ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
// import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { localizePath, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages";

type LinkItem = {
	label: string;
	href: string;
	external?: boolean;
	description?: string;
};
type NavItem =
	| { label: string; href: string; external?: boolean }
	| { label: string; children: LinkItem[] };

function localizeNavItems(messages: Messages["navigation"]): NavItem[] {
	const labels: Record<string, string> = {
		Home: messages.home,
		"Services and Amenities": messages.services,
		"Lounge Guide": messages.lounges,
		"Cabin Guide": messages.cabins,
		"Flight Schedule / Network": messages.flightNetwork,
		"Flight Schedule": messages.schedule,
		"2D Route Network": messages.network2d,
		"3D Route Network": messages.network3d,
		"Fans & Playground": messages.playground,
		"Flying Route Visualizer": messages.routeVisualizer,
		"Cathay Fleet": messages.fleet,
		"Chatbot about Cathay": messages.chatbot,
		"World of Airports": messages.worldOfAirports,
		"About This Project": messages.aboutProject,
		"Message From Developer": messages.about,
	};
	const descriptions: Record<string, string> = {
		"Get the most out of your lounge visit": messages.loungesDescription,
		"Pick among the exception comfort": messages.cabinsDescription,
		"Weekly schedules for all flights": messages.scheduleDescription,
		"Discover global coverage and destinations":
			messages.network2dDescription,
		"Explore the same network on a 3D globe": messages.network3dDescription,
		"View the actual route of your flight":
			messages.routeVisualizerDescription,
		"Explore fleets' specs and configurations": messages.fleetDescription,
		"Temporarily offline due to high API and vector DB costs":
			messages.chatbotDescription,
		"Find HKG alliance friends and exchange game IDs":
			messages.worldOfAirportsDescription,
		"Some information you should know": messages.aboutDescription,
	};

	return NAV_ITEMS.map((item) =>
		"href" in item
			? { ...item, label: labels[item.label] ?? item.label }
			: {
					...item,
					label: labels[item.label] ?? item.label,
					children: item.children.map((child) => ({
						...child,
						label: labels[child.label] ?? child.label,
						description: child.description
							? (descriptions[child.description] ??
								child.description)
							: undefined,
					})),
				},
	);
}

const NAV_ITEMS: NavItem[] = [
	{ label: "Home", href: "/" },
	{
		label: "Services and Amenities",
		children: [
			{
				label: "Lounge Guide",
				href: "/lounges",
				description: "Get the most out of your lounge visit",
			},
			{
				label: "Cabin Guide",
				href: "/cabins",
				description: "Pick among the exception comfort",
			},
		],
	},
	{
		label: "Flight Schedule / Network",
		children: [
			{
				label: "Flight Schedule",
				href: "/schedule",
				description: "Weekly schedules for all flights",
			},
			{
				label: "2D Route Network",
				href: "/network/2d",
				description: "Discover global coverage and destinations",
			},
			{
				label: "3D Route Network",
				href: "/network/3d",
				description: "Explore the same network on a 3D globe",
			},
		],
	},
	{
		label: "Fans & Playground",
		children: [
			{
				label: "Flying Route Visualizer",
				href: "/route-visualizer",
				description: "View the actual route of your flight",
			},
			{
				label: "Cathay Fleet",
				href: "/fleet",
				description: "Explore fleets' specs and configurations",
			},
			{
				label: "Chatbot about Cathay",
				href: "/under-development",
				description:
					"Temporarily offline due to high API and vector DB costs",
			},
			{
				label: "World of Airports",
				href: "/world-of-airports",
				description: "Find HKG alliance friends and exchange game IDs",
			},
		],
	},
	{
		label: "About This Project",
		children: [
			{
				label: "Message From Developer",
				href: "/about",
				description: "Some information you should know",
			},
		],
	},
];

export default function NavBar({
	locale,
	messages,
}: {
	locale: Locale;
	messages: Messages["navigation"];
}) {
	const [open, setOpen] = useState(false);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const pathname = usePathname();
	const drawerRef = useRef<HTMLDivElement | null>(null);
	const menuButtonRef = useRef<HTMLButtonElement | null>(null);
	const hrefFor = (href: string) => localizePath(href, locale);
	const navItems = localizeNavItems(messages);

	// Close on route change
	useEffect(() => {
		setOpen(false);
		setExpanded({});
	}, [pathname]);

	// Escape to close + lock scroll + return focus to menu button
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		if (open) {
			document.addEventListener("keydown", onKey);
			document.body.style.overflow = "hidden";
		} else {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
			// return focus for a11y
			menuButtonRef.current?.focus();
		}
		return () => document.removeEventListener("keydown", onKey);
	}, [open]);

	// Click outside to close
	useEffect(() => {
		function onClick(e: MouseEvent) {
			if (!open) return;
			if (
				drawerRef.current &&
				!drawerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, [open]);

	const toggleSection = (key: string) =>
		setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

	return (
		<>
			{/* Top bar */}
			<header className="sticky top-0 h-14 border-b border-slate-200 bg-[#f7f6f2] z-1000000002">
				<div className="mx-auto flex h-full max-w-6xl items-center justify-between px-3">
					<button
						ref={menuButtonRef}
						onClick={() => setOpen(true)}
						aria-label={messages.openMenu}
						aria-haspopup="dialog"
						aria-expanded={open}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-900 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
					>
						<Bars3Icon className="h-6 w-6" />
					</button>

					<Link
						href={hrefFor("/")}
						className="flex items-end gap-2 text-[#096963f6]"
						aria-label={messages.home}
					>
						<WingLogo />
						<span className="text-md font-semibold tracking-wide sm:inline self-end">
							The Jade Wings
						</span>
					</Link>

					<Link
						href={hrefFor("/about")}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-900 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
						aria-label={messages.about}
					>
						<ExclamationCircleIcon className="h-6 w-6" />
					</Link>
				</div>
			</header>

			{/* Backdrop */}
			<div
				className={`fixed inset-0 z-1000000002 bg-black/40 transition-opacity ${
					open ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
				aria-hidden={!open}
			/>

			{/* Drawer */}
			<aside
				ref={drawerRef}
				role="dialog"
				aria-modal="true"
				aria-label={messages.mainMenu}
				className={`fixed inset-y-0 left-0 flex w-[92vw] max-w-sm transform flex-col bg-[#f6f7f2] shadow-xl transition-transform duration-300 ${
					open ? "translate-x-0" : "-translate-x-full"
				} z-1000000002`}
			>
				{/* Hero with image */}
				<div className="relative h-40 shrink-0">
					{/* Replace src with your own image file or remote URL you control.
             Add the domain to next.config.js images.domains if remote. */}
					<Image
						src="/images/background/fleet_on_ground.webp"
						alt="Jade Wings banner"
						fill
						priority
						className="object-cover"
						sizes="(max-width: 640px) 92vw, 420px"
					/>
					{/* Overlay for readability */}
					<div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply" />
					{/* Close button */}
					<button
						onClick={() => setOpen(false)}
						aria-label={messages.closeMenu}
						className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
					>
						<XMarkIcon className="h-6 w-6" />
					</button>
				</div>

				{/* Nav */}
				<nav className="flex-1 overflow-y-auto">
					<ul className="divide-y divide-slate-200">
						{navItems.map((item) => {
							const isLink = "href" in item;
							// const active = isLink && pathname === item.href;
							return (
								<li
									key={item.label}
									className="bg-[#f6f7f2]"
								>
									{isLink ? (
										<Link
											href={hrefFor(item.href)}
											target={
												item.external
													? "_blank"
													: undefined
											}
											className={`flex items-center justify-between gap-2 px-5 py-4 text-[15px] font-semibold text-slate-800 hover:bg-slate-50`}
										>
											<span>{item.label}</span>
											{item.external ? (
												<ArrowTopRightOnSquareIcon className="h-4 w-4" />
											) : null}
										</Link>
									) : (
										<div>
											<button
												onClick={() =>
													toggleSection(item.label)
												}
												aria-expanded={
													!!expanded[item.label]
												}
												aria-controls={`sect-${slug(
													item.label,
												)}`}
												className="flex w-full items-center justify-between px-5 py-4 text-left text-[15px] font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
											>
												<span>{item.label}</span>
												<ChevronRightIcon
													className={`h-5 w-5 transition-transform ${
														expanded[item.label]
															? "rotate-90"
															: ""
													}`}
												/>
											</button>

											{/* Smooth open/close using CSS grid technique */}
											<ul
												id={`sect-${slug(item.label)}`}
												className={`space-y-1 overflow-hidden px-2 transition-[grid-template-rows] duration-300 [display:grid] ${
													expanded[item.label]
														? "[grid-template-rows:1fr]"
														: "[grid-template-rows:0fr]"
												}`}
											>
												<div className="min-h-0 overflow-hidden">
													{item.children.map((c) => (
														<li key={c.label}>
															<Link
																href={hrefFor(
																	c.href,
																)}
																target={
																	c.external
																		? "_blank"
																		: undefined
																}
																className="block rounded-md px-5 py-3 hover:bg-slate-50"
															>
																<div className="text-[15px] font-semibold text-[#004b47]">
																	{c.label}
																</div>
																{c.description ? (
																	<div className="mt-0.5 text-sm text-slate-500">
																		{
																			c.description
																		}
																	</div>
																) : null}
															</Link>
														</li>
													))}
												</div>
											</ul>
										</div>
									)}
								</li>
							);
						})}
					</ul>
				</nav>

				{/* <div className="shrink-0 border-t border-slate-200 bg-white/40 px-5 py-3">
					<div className="flex items-center justify-between gap-3">
						<span className="text-sm font-semibold text-slate-700">
							{messages.language}
						</span>
						<LanguageSwitcher
							locale={locale}
							label={messages.language}
						/>
					</div>
				</div> */}
			</aside>
		</>
	);
}

function slug(s: string) {
	return s.toLowerCase().replace(/\s+/g, "-");
}

/* Minimal wing-like logo (replace with your own if needed) */
function WingLogo() {
	return (
		<Image
			src={"/images/icons/jade_wings.png"}
			width={48}
			height={48}
			className="h-7 w-7"
			alt={"Cathay Pacific"}
		/>
	);
}
