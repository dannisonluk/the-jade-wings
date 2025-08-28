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
	UserCircleIcon,
	ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

type LinkItem = {
	label: string;
	href: string;
	external?: boolean;
	description?: string;
};
type NavItem =
	| { label: string; href: string; external?: boolean }
	| { label: string; children: LinkItem[] };

const NAV_ITEMS: NavItem[] = [
	{ label: "Home", href: "/" },
	{
		label: "Flight Lookup",
		children: [
			{
				label: "Search Flights",
				href: "/flight_search",
				description:
					"Check aircraft type, flight history and on-time performance",
			},
		],
	},
	{
		label: "Fleet Explorer",
		children: [
			{
				label: "View Fleet",
				href: "/fleet",
				description: "Explore Cathay's specs and configurations",
			},
		],
	},
	{
		label: "Flight Schedule",
		children: [
			{
				label: "View Schedule",
				href: "/schedule",
				description: "Weekly schedules for all flights",
			},
		],
	},
	{
		label: "Route Network",
		children: [
			{
				label: "Explore Routes",
				href: "/routes",
				description: "Discover global coverage and destinations",
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

export default function NavBar() {
	const [open, setOpen] = useState(false);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});
	const pathname = usePathname();
	const drawerRef = useRef<HTMLDivElement | null>(null);
	const menuButtonRef = useRef<HTMLButtonElement | null>(null);

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
			<header className="sticky top-0 z-50 h-14 border-b border-slate-200 bg-[#f7f6f2]">
				<div className="mx-auto flex h-full max-w-6xl items-center justify-between px-3">
					<button
						ref={menuButtonRef}
						onClick={() => setOpen(true)}
						aria-label="Open menu"
						aria-haspopup="dialog"
						aria-expanded={open}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-900 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
					>
						<Bars3Icon className="h-6 w-6" />
					</button>

					<Link
						href="/"
						className="flex items-center gap-2 text-slate-900"
						aria-label="Home"
					>
						<WingLogo />
						<span className="hidden text-sm font-semibold tracking-wide sm:inline">
							Cathay Tracker
						</span>
					</Link>

					<Link
						href="/about"
						className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-900 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
						aria-label="About"
					>
						<ExclamationCircleIcon className="h-6 w-6" />
					</Link>
				</div>
			</header>

			{/* Backdrop */}
			<div
				className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
					open ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
				aria-hidden={!open}
			/>

			{/* Drawer */}
			<aside
				ref={drawerRef}
				role="dialog"
				aria-modal="true"
				aria-label="Main menu"
				className={`fixed inset-y-0 left-0 z-50 flex w-[92vw] max-w-sm transform flex-col bg-white shadow-xl transition-transform duration-300 ${
					open ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Hero with image */}
				<div className="relative h-40 shrink-0">
					{/* Replace src with your own image file or remote URL you control.
             Add the domain to next.config.js images.domains if remote. */}
					<Image
						src="/images/background/fleet_on_ground.webp"
						alt="Cathay Tracker banner"
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
						aria-label="Close menu"
						className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
					>
						<XMarkIcon className="h-6 w-6" />
					</button>
				</div>

				{/* Nav */}
				<nav className="flex-1 overflow-y-auto">
					<ul className="divide-y divide-slate-200">
						{NAV_ITEMS.map((item) => {
							const isLink = "href" in item;
							const active = isLink && pathname === item.href;
							return (
								<li
									key={item.label}
									className="bg-white"
								>
									{isLink ? (
										<Link
											href={item.href}
											target={
												item.external
													? "_blank"
													: undefined
											}
											className={`flex items-center justify-between gap-2 px-5 py-4 text-[15px] font-semibold ${
												active
													? "text-emerald-700"
													: "text-slate-900"
											} hover:bg-slate-50`}
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
													item.label
												)}`}
												className="flex w-full items-center justify-between px-5 py-4 text-left text-[15px] font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
																href={c.href}
																target={
																	c.external
																		? "_blank"
																		: undefined
																}
																className="block rounded-md px-5 py-3 hover:bg-slate-50"
															>
																<div className="text-[15px] font-semibold text-slate-900">
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

				{/* Footer */}
				{/* <div className="border-t border-slate-200 p-4">
					<Link
						href="/help/contact"
						className="font-semibold text-emerald-700 hover:underline"
					>
						Contact us
					</Link>
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
		<svg
			viewBox="0 0 48 48"
			className="h-7 w-7"
			aria-hidden="true"
		>
			<path
				d="M6 28c12-1 17-8 36-16-6 9-10 18-28 22 8 0 14-1 22-4-6 6-14 10-26 10-3 0-5-2-5-5 0-3 0-6 1-7z"
				fill="#059669"
			/>
		</svg>
	);
}
