"use client";

import Link from "@/components/i18n/LocalizedLink";
import { ChevronRight, CreditCard, Luggage, Plane, Globe } from "lucide-react";

const topics = [
	{
		title: "Booking and Tickets",
		description: "Reservations, payments, and ticket changes.",
		icon: <CreditCard className="w-5 h-5 text-[#004b47]" />,
		href: "/faq/booking",
		children: [
			{ title: "Booking online", href: "/faq/booking/online" },
			{ title: "Payments", href: "/faq/booking/payments" },
			{ title: "Refunds", href: "/faq/booking/refunds" },
		],
	},
	{
		title: "Baggage",
		description: "Allowance, restrictions, and lost luggage.",
		icon: <Luggage className="w-5 h-5 text-[#004b47]" />,
		href: "/faq/baggage",
		children: [
			{ title: "Cabin baggage", href: "/faq/baggage/cabin" },
			{ title: "Checked baggage", href: "/faq/baggage/checked" },
			{ title: "Lost and found", href: "/faq/baggage/lost" },
		],
	},
	{
		title: "Check-in and Boarding",
		description: "Online check-in, boarding gates, and policies.",
		icon: <Plane className="w-5 h-5 text-[#004b47]" />,
		href: "/faq/checkin",
		children: [
			{ title: "Online check-in", href: "/faq/checkin/online" },
			{ title: "Airport check-in", href: "/faq/checkin/airport" },
			{ title: "Boarding gates", href: "/faq/checkin/gates" },
		],
	},
	{
		title: "Travel Information",
		description: "Visas, special assistance, and general travel tips.",
		icon: <Globe className="w-5 h-5 text-[#004b47]" />,
		href: "/faq/travel",
		children: [
			{ title: "Visas and immigration", href: "/faq/travel/visas" },
			{ title: "Special assistance", href: "/faq/travel/assistance" },
			{ title: "Health and safety", href: "/faq/travel/health" },
		],
	},
];

export default function FAQParentPage() {
	return (
		<main className="min-h-screen bg-white">
			<header className="bg-gradient-to-b from-teal-50 to-white">
				<div className="max-w-4xl mx-auto px-6 sm:px-6 pt-6 sm:py-14">
					<h1 className="text-xl font-extrabold tracking-tight text-[#004b47]">
						Frequently Asked Questions
					</h1>
				</div>
			</header>

			{/* Topics */}
			<section className="max-w-4xl mx-auto px-6 py-4 space-y-6">
				{topics.map((topic) => (
					<div
						key={topic.title}
						className="bg-white rounded-xl shadow-sm border border-gray-200"
					>
						{/* Parent row */}
						<Link
							href={topic.href}
							className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
									{topic.icon}
								</div>
								<h2 className="font-semibold text-gray-800">
									{topic.title}
								</h2>
							</div>
							<ChevronRight className="w-5 h-5 text-gray-400" />
						</Link>

						{/* Sub-links */}
						{topic.children && (
							<div className="px-5 pb-3">
								<ul className="space-y-2 mt-1">
									{topic.children.map((child) => (
										<li key={child.title}>
											<Link
												href={child.href}
												className="flex items-center justify-between text-sm text-gray-600 hover:text-[#004b47] hover:underline"
											>
												{child.title}
												<ChevronRight className="w-4 h-4 text-gray-400" />
											</Link>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				))}
			</section>
		</main>
	);
}
