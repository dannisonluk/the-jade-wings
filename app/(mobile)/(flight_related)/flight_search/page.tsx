"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	MagnifyingGlassIcon,
	ClockIcon,
	CalendarDaysIcon,
	ExclamationTriangleIcon,
	PaperAirplaneIcon,
	MapPinIcon,
	InformationCircleIcon,
	QuestionMarkCircleIcon,
	XMarkIcon,
	SparklesIcon,
	ShieldCheckIcon,
} from "@heroicons/react/24/outline";

/* ===================== Types ===================== */

interface FlightData {
	date: string;
	from: string;
	to: string;
	aircraft: string;
	flightTime: string;
	std: string;
	atd: string;
	sta: string;
	ata: string;
	status: string;
}

interface FlightMetadata {
	region: string;
	origin: string;
	layover: string;
	destination: string;
	port: string;
}

interface FlightSearchResult {
	flightNumber: string;
	flights: FlightData[];
	metadata?: FlightMetadata;
	source?: Array<{
		airport: string;
		region: string;
	}>;
}

interface RouteInfo {
	from: string;
	to: string;
	hasLayover: boolean;
	layover?: string;
}

/* ===================== Helpers ===================== */

const parseTimeToMinutes = (t: string | undefined | null): number | null => {
	if (!t) return null;
	const s = String(t).trim();
	if (s === "--" || s === "-") return null;
	const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
	if (m24) {
		const h = Number(m24[1]),
			m = Number(m24[2]);
		if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null;
		return h * 60 + m;
	}
	const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
	if (m12) {
		let h = Number(m12[1]);
		const m = Number(m12[2]);
		const p = m12[3].toUpperCase();
		if (h === 12) h = 0;
		if (p === "PM") h += 12;
		if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null;
		return h * 60 + m;
	}
	return null;
};

type PerfLevel = "good" | "warn" | "bad" | "neutral";

const computeArrivalPerformance = (
	sta: string,
	ataStr?: string | null
): { diffMin: number | null; level: PerfLevel } => {
	const sched = parseTimeToMinutes(sta);
	const actualRaw = parseTimeToMinutes(ataStr ?? "");
	if (sched === null || actualRaw === null)
		return { diffMin: null, level: "neutral" };
	let actual = actualRaw;
	if (actual < sched - 720) actual += 1440;
	const diff = actual - sched;
	if (diff <= 15) return { diffMin: diff, level: "good" };
	if (diff <= 30) return { diffMin: diff, level: "warn" };
	return { diffMin: diff, level: "bad" };
};

const ataFromStatus = (status?: string | null): string | null => {
	if (!status) return null;
	const m1 = status.match(/landed\s+(\d{1,2}):(\d{2})/i);
	if (m1) return `${m1[1]}:${m1[2]}`;
	const m2 = status.match(/delayed\s+(\d{1,2}):(\d{2})/i);
	if (m2) return `${m2[1]}:${m2[2]}`;
	const m3 = status.match(/estimated\s+(\d{1,2}):(\d{2})/i);
	if (m3) return `${m3[1]}:${m3[2]}`;
	return null;
};

const statusAccentClass = (
	status: string,
	sta: string,
	ata?: string | null
): string => {
	const s = status.toLowerCase();
	if (s.includes("scheduled")) return "bg-[#C8C6CC]";
	if (s.includes("cancelled")) return "bg-[#F87171]";
	if (s.includes("delayed")) return "bg-[#C5B69C]";
	if (s.includes("landed")) {
		const ataGuess = ataFromStatus(status) ?? ata ?? undefined;
		const p = computeArrivalPerformance(sta, ataGuess);
		if (p.level === "good") return "bg-[#0F7A6C]";
		if (p.level === "warn") return "bg-[#C5B69C]";
		if (p.level === "bad") return "bg-[#F87171]";
		return "bg-[#DADDE1]";
	}
	if (s.includes("estimated")) return "bg-[#C5B69C]";
	return "bg-[#DADDE1]";
};

const statusBadgeColor = (status: string, sta: string, ata?: string | null) => {
	const s = status.toLowerCase();
	if (s.includes("cancelled"))
		return "bg-[#FEF2F2] text-[#7F1D1D] border-[#FECACA]";
	if (s.includes("scheduled"))
		return "bg-[#DADDE1] text-[#374151] border-[#C8C6CC]";
	if (s.includes("delayed"))
		return "bg-[#F7F4EE] text-[#5B4E3B] border-[#D8CDB0]";
	if (s.includes("landed")) {
		const ataGuess = ataFromStatus(status) ?? ata ?? undefined;
		const p = computeArrivalPerformance(sta, ataGuess);
		if (p.level === "good")
			return "bg-[#EAF5F2] text-[#0F7A6C] border-[#5FAE9E33]";
		if (p.level === "warn")
			return "bg-[#F7F4EE] text-[#5B4E3B] border-[#D8CDB0]";
		if (p.level === "bad")
			return "bg-[#FEF2F2] text-[#7F1D1D] border-[#FECACA]";
		return "bg-[#DADDE1] text-[#374151] border-[#C8C6CC]";
	}
	if (s.includes("estimated"))
		return "bg-[#F7F4EE] text-[#5B4E3B] border-[#D8CDB0]";
	return "bg-[#DADDE1] text-[#374151] border-[#C8C6CC]";
};

const parseFlightDate = (d: string): Date | null => {
	const ts = Date.parse(d);
	return Number.isNaN(ts) ? null : new Date(ts);
};

const getWindowBounds = () => {
	const now = new Date();
	const start = new Date(
		now.getFullYear(),
		5, // June
		1,
		0,
		0,
		0,
		0
	);
	const end = new Date(
		now.getFullYear(),
		7, // July
		0,
		23,
		59,
		59,
		999
	);
	return { start, end };
};

const extractAircraftType = (s?: string | null): string =>
	s ? s.replace(/\s*\([^)]*\)\s*$/, "").trim() : "";

const getActualRoute = (
	metadata?: FlightMetadata,
	flights?: FlightData[]
): RouteInfo | null => {
	if (metadata) {
		if (
			metadata.layover &&
			metadata.layover !== "N/A" &&
			metadata.layover !== ""
		) {
			return {
				from: metadata.origin,
				to: metadata.destination,
				hasLayover: true,
				layover: metadata.layover,
			};
		}
		return {
			from: metadata.origin,
			to: metadata.destination,
			hasLayover: false,
		};
	}

	if (flights && flights.length > 0) {
		return {
			from: flights[0].from,
			to: flights[0].to,
			hasLayover: false,
		};
	}

	return null;
};

/* ===================== Component ===================== */

export default function FlightSearchPage() {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [searchResult, setSearchResult] = useState<FlightSearchResult | null>(
		null
	);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [showHelp, setShowHelp] = useState<boolean>(false);

	const handleSearch = async (): Promise<void> => {
		if (!searchQuery.trim()) {
			setError("Please enter a flight number");
			return;
		}
		setLoading(true);
		setError("");
		setSearchResult(null);
		try {
			const response = await fetch(`/api/flight/${searchQuery.trim()}`);
			if (!response.ok) {
				setError(
					response.status === 404
						? "Flight not found. Please check the flight number and try again."
						: "An error occurred while searching. Please try again."
				);
				return;
			}
			const data: FlightSearchResult = await response.json();
			setSearchResult(data);
		} catch {
			setError("Failed to search for flight. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === "Enter") handleSearch();
	};

	const handleQuickSearch = async (flightNumber: string): Promise<void> => {
		setSearchQuery(flightNumber);
		setLoading(true);
		setError("");
		setSearchResult(null);
		try {
			const response = await fetch(`/api/flight/${flightNumber}`);
			if (!response.ok) {
				setError(
					response.status === 404
						? "Flight not found. Please check the flight number and try again."
						: "An error occurred while searching. Please try again."
				);
				return;
			}
			const data: FlightSearchResult = await response.json();
			setSearchResult(data);
		} catch {
			setError("Failed to search for flight. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const filteredFlights = useMemo<FlightData[]>(() => {
		if (!searchResult?.flights?.length) return [];
		const { start, end } = getWindowBounds();
		return searchResult.flights.filter((f) => {
			const d = parseFlightDate(f.date);
			if (!d) return false;
			return d >= start && d <= end;
		});
	}, [searchResult]);

	const actualRoute = useMemo(() => {
		return getActualRoute(searchResult?.metadata, filteredFlights);
	}, [searchResult?.metadata, filteredFlights]);

	const flownFlights = useMemo<FlightData[]>(() => {
		return filteredFlights.filter(
			(f) => !f.status.toLowerCase().includes("scheduled")
		);
	}, [filteredFlights]);

	const totalFlights = flownFlights.length;

	const delayedCount = useMemo(() => {
		let count = 0;
		for (const f of flownFlights) {
			const ataGuess =
				ataFromStatus(f.status) ??
				(f.ata && f.ata !== "--" ? f.ata : null);
			const perf = computeArrivalPerformance(
				f.sta,
				ataGuess ?? undefined
			);
			if (
				perf.diffMin !== null &&
				(perf.level === "warn" || perf.level === "bad")
			) {
				count++;
			}
		}
		return count;
	}, [flownFlights]);

	const topAircraft = useMemo(() => {
		const map = new Map<string, number>();
		for (const f of flownFlights) {
			const type = extractAircraftType(f.aircraft);
			if (!type) continue;
			map.set(type, (map.get(type) || 0) + 1);
		}
		return Array.from(map.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 2);
	}, [flownFlights]);

	const extraCount = Math.max(
		0,
		(searchResult?.flights?.length ?? 0) - filteredFlights.length
	);

	return (
		<div className="bg-gradient-to-b from-[#EAF5F2] via-[#FFFFFF] to-[#F7F4EE]">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
				{/* Hero */}
				<div className="relative overflow-hidden rounded-xl border border-[#DADDE1] bg-[#FFFFFF] shadow-sm">
					<div className="relative p-4 sm:p-5">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-[#EAF5F2]">
									<PaperAirplaneIcon className="h-5 w-5 text-[#0F7A6C]" />
								</div>
								<div>
									<h1 className="text-2xl font-semibold tracking-tight text-[#0F7A6C]">
										Flight Explorer
									</h1>
									<p className="text-[#475569] text-sm mt-0.5">
										Search flight history and performance
									</p>
								</div>
							</div>

							<div className="w-full md:w-[440px]">
								<div className="rounded-lg border border-[#DADDE1] p-2 bg-[#FFFFFF]">
									<div className="flex items-center gap-2">
										<MagnifyingGlassIcon className="h-5 w-5 text-[#64748B] ml-2" />
										<Input
											placeholder="Enter flight number"
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(
													e.target.value.toUpperCase()
												)
											}
											onKeyPress={handleKeyPress}
											className="bg-transparent border-0 text-[#0F172A] placeholder:text-[#94A3B8] focus-visible:ring-0 focus-visible:outline-none"
											disabled={loading}
										/>
										<Button
											onClick={handleSearch}
											disabled={loading}
											className="bg-[#0F7A6C] hover:bg-[#2F8D7F] text-white h-9 px-3 rounded-md"
										>
											{loading
												? "Searching..."
												: "Search"}
										</Button>
									</div>
								</div>
								<div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
									{[
										"CX506",
										"CX596",
										"CX598",
										"CX502",
										"CX564",
									].map((f) => (
										<button
											key={f}
											onClick={() => handleQuickSearch(f)}
											className="px-2 py-1 rounded-md border border-[#DADDE1] bg-[#FFFFFF] text-[#0F7A6C] hover:bg-[#EAF5F2] transition"
										>
											{f}
										</button>
									))}
									<span className="px-2 py-1 rounded-md border border-[#DADDE1] bg-[#FFFFFF] text-[#475569]">
										Only Japan routes are supported now for
										feature testing
									</span>
								</div>
							</div>
						</div>

						{error && (
							<div className="mt-3">
								<Alert className="border-[#FECACA] bg-[#FEF2F2] text-[#7F1D1D]">
									<ExclamationTriangleIcon className="h-4 w-4" />
									<AlertTitle className="font-medium">
										Error
									</AlertTitle>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							</div>
						)}
					</div>
				</div>

				{/* Results */}
				{searchResult && (
					<div className="mt-8 space-y-6">
						{/* Summary */}
						<Card className="shadow-sm border border-[#DADDE1] overflow-hidden gap-0 py-0">
							<div className="p-5 bg-gradient-to-r from-[#EAF5F2] to-[#FFFFFF]">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2.5">
										<div className="p-2 bg-[#FFFFFF] border border-[#DADDE1] rounded-md">
											<PaperAirplaneIcon className="h-5 w-5 text-[#0F7A6C]" />
										</div>
										<h2 className="text-xl font-semibold text-[#0F7A6C]">
											{searchResult.flightNumber}
										</h2>
									</div>
									<Badge className="bg-[#FFFFFF] text-[#0F7A6C] border border-[#DADDE1] text-sm px-3 py-1">
										{filteredFlights.length} Records
									</Badge>
								</div>

								<div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
									<div className="bg-[#FFFFFF] rounded-md p-3 border border-[#DADDE1]">
										<div className="flex items-start gap-2.5">
											<CalendarDaysIcon className="h-5 w-5 text-[#2F8D7F]" />
											<div>
												<p className="text-[#64748B] text-xs">
													Latest Flight
												</p>
												<p className="text-lg font-medium text-[#0F7A6C]">
													{filteredFlights[0]?.date ||
														"N/A"}
												</p>
											</div>
										</div>
									</div>

									<div className="bg-[#FFFFFF] rounded-md p-3 border border-[#DADDE1]">
										<div className="flex items-start gap-2.5">
											<MapPinIcon className="h-5 w-5 text-[#2F8D7F]" />
											<div className="flex-1">
												<p className="text-[#64748B] text-xs">
													Route{" "}
													{actualRoute?.hasLayover &&
														"(with stopover)"}
												</p>
												<p className="text-md font-medium text-[#0F7A6C]">
													{actualRoute
														? `${actualRoute.from} → ${actualRoute.to}`
														: "N/A"}

													{actualRoute?.hasLayover &&
														actualRoute.layover && (
															<span className="ml-2 text-md font-medium text-[#0F7A6C]">
																layover at{" "}
																{
																	actualRoute.layover
																}
															</span>
														)}
												</p>
											</div>
										</div>
									</div>

									<div className="bg-[#FFFFFF] rounded-md p-3 border border-[#DADDE1]">
										<div className="flex items-start gap-2.5">
											<ClockIcon className="h-5 w-5 text-[#2F8D7F]" />
											<div>
												<p className="text-[#64748B] text-xs">
													Scheduled Departure
												</p>
												<p className="text-lg font-medium text-[#0F7A6C]">
													{filteredFlights[0]?.std ||
														"--"}
												</p>
											</div>
										</div>
									</div>

									<div className="bg-[#FFFFFF] rounded-md p-3 border border-[#DADDE1]">
										<div className="flex items-start gap-2.5">
											<ClockIcon className="h-5 w-5 text-[#2F8D7F]" />
											<div>
												<p className="text-[#64748B] text-xs">
													Scheduled Arrival
												</p>
												<p className="text-lg font-medium text-[#0F7A6C]">
													{filteredFlights[0]?.sta ||
														"--"}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Card>

						{/* Stats */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card className="border border-[#DADDE1] shadow-sm bg-[#FFFFFF] py-1">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-[11px] font-medium tracking-wider text-[#2F8D7F]">
												TOTAL FLOWN (PAST 2 MONTHS)
											</p>
											<p className="text-3xl font-semibold mt-1 text-[#0F7A6C]">
												{totalFlights}
											</p>
										</div>
										<div className="p-2.5 rounded-md bg-[#EAF5F2] text-[#0F7A6C]">
											<PaperAirplaneIcon className="h-5 w-5" />
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="border border-[#DADDE1] shadow-sm bg-[#FFFFFF] py-1">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p
												className="text-[11px] font-medium tracking-wider"
												style={{ color: "#5B4E3B" }}
											>
												{"DELAYED (>15M)"}
											</p>
											<p className="text-3xl font-semibold mt-1 text-[#0F7A6C]">
												{totalFlights
													? `${Math.round(
															(delayedCount /
																totalFlights) *
																100
													  )}%`
													: "0%"}{" "}
												({delayedCount}/{totalFlights})
											</p>
										</div>
										<div
											className="p-2.5 rounded-md bg-[#F7F4EE]"
											style={{ color: "#5B4E3B" }}
										>
											<ClockIcon className="h-5 w-5" />
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Aircraft Types */}
						<Card className="border border-[#DADDE1] shadow-sm bg-[#FFFFFF] py-1">
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<div className="p-2.5 rounded-md bg-[#EAF5F2] text-[#0F7A6C]">
										<SparklesIcon className="h-5 w-5" />
									</div>
									<div className="flex-1">
										<h3 className="text-base font-semibold text-[#0F7A6C]">
											Likely aircraft types for this route
										</h3>
										<p className="text-sm text-[#475569] mt-0.5">
											Based on flown records in the last 2
											months:
										</p>

										<div className="mt-3 flex flex-wrap gap-2">
											{topAircraft.length > 0 ? (
												topAircraft.map(
													([type, count]) => (
														<div
															key={type}
															className="flex items-center gap-1.5"
														>
															<span className="inline-flex items-center rounded-full bg-[#EAF5F2] text-[#0F7A6C] px-2.5 py-1 ring-1 ring-[#5FAE9E33] font-medium">
																{type}
															</span>
															<span className="text-xs text-[#334155] px-1.5 py-0.5 rounded bg-[#FFFFFF] ring-1 ring-[#DADDE1]">
																×{count}
															</span>
														</div>
													)
												)
											) : (
												<div className="px-3 py-1.5 rounded bg-[#DADDE1] text-[#475569] ring-1 ring-[#C8C6CC]">
													Not enough data
												</div>
											)}
										</div>

										{topAircraft.length >= 1 && (
											<p className="mt-3 text-xs text-[#475569]">
												Hint: There&apos;s a good chance your
												upcoming flight uses{" "}
												{topAircraft
													.map(([t], i) =>
														i === 1 ? ` or ${t}` : t
													)
													.join("")}
												.
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Table */}
						<Card className="shadow-sm border-[#DADDE1] overflow-hidden gap-0 py-0">
							<CardHeader className="bg-[#EAF5F2] py-3 border-[#DADDE1] gap-0">
								<div className="flex items-center justify-between">
									<CardTitle className="text-base sm:text-lg flex items-center font-semibold text-[#0F7A6C]">
										<InformationCircleIcon className="h-5 w-5 mr-2 text-[#2F8D7F]" />
										Flight History (Latest 2 Months)
									</CardTitle>
								</div>
							</CardHeader>

							<CardContent className="p-0">
								<div className="overflow-x-auto">
									<div className="min-w-[880px]">
										<Table>
											<TableHeader>
												<TableRow className="bg-[#FFFFFF] sticky top-0 border-b border-[#DADDE1]">
													<TableHead className="py-2.5 pl-5 text-[#374151] font-medium">
														Date
													</TableHead>
													<TableHead className="py-2.5 text-[#374151] font-medium">
														From
													</TableHead>
													<TableHead className="py-2.5 text-[#374151] font-medium">
														To
													</TableHead>
													<TableHead className="py-2.5 text-[#374151] font-medium text-center">
														Aircraft
													</TableHead>
													<TableHead className="py-2.5 text-[#374151] font-medium text-center">
														Flight Time
													</TableHead>
													<TableHead className="py-2.5 text-[#374151] font-medium text-center">
														STD
													</TableHead>
													<TableHead className="py-2.5 text-[#374151] font-medium text-center">
														ATD
													</TableHead>
													<TableHead className="py-2.5 text-[#374151] font-medium text-center">
														STA
													</TableHead>
													<TableHead className="py-2.5 pr-5 text-[#374151] font-medium">
														Status
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{filteredFlights.map(
													(
														f: FlightData,
														i: number
													) => {
														const accent =
															statusAccentClass(
																f.status,
																f.sta,
																f.ata
															);
														const badgeClass =
															statusBadgeColor(
																f.status,
																f.sta,
																f.ata
															);
														const isSegment =
															searchResult
																?.metadata
																?.layover &&
															(f.from ===
																searchResult
																	.metadata
																	.layover ||
																f.to ===
																	searchResult
																		.metadata
																		.layover);

														return (
															<TableRow
																key={`${f.date}-${i}`}
																className="group border-b last:border-b-0 border-[#DADDE1] hover:bg-[#EAF5F2] transition-colors"
															>
																<TableCell className="py-2.5 pl-5 whitespace-nowrap">
																	<div className="flex items-center gap-2">
																		<span
																			className={`inline-block h-3.5 w-1 rounded ${accent}`}
																		/>
																		<span className="text-[#0F7A6C]">
																			{
																				f.date
																			}
																		</span>
																	</div>
																</TableCell>

																<TableCell className="py-2.5">
																	<div className="flex items-center gap-1">
																		<span className="text-[#0F172A]">
																			{
																				f.from
																			}
																		</span>
																		{isSegment && (
																			<Badge className="text-xs scale-90 bg-[#EAF5F2] text-[#0F7A6C] border-[#5FAE9E33]">
																				segment
																			</Badge>
																		)}
																	</div>
																</TableCell>

																<TableCell className="py-2.5">
																	<span className="text-[#0F172A]">
																		{f.to}
																	</span>
																</TableCell>

																<TableCell className="py-2.5 text-center">
																	<span className="font-mono text-[#0F172A]">
																		{f.aircraft ||
																			"--"}
																	</span>
																</TableCell>

																<TableCell className="py-2.5 text-center">
																	{f.flightTime !==
																	"--" ? (
																		<span className="inline-flex items-center rounded px-2 py-0.5 border text-xs font-mono text-[#1F2937] border-[#DADDE1] bg-[#FFFFFF]">
																			{
																				f.flightTime
																			}
																		</span>
																	) : (
																		<span className="text-[#94A3B8]">
																			--
																		</span>
																	)}
																</TableCell>

																<TableCell className="py-2.5 text-center">
																	<span className="font-mono font-medium text-[#0F7A6C]">
																		{f.std}
																	</span>
																</TableCell>

																<TableCell className="py-2.5 text-center">
																	{f.atd !==
																	"--" ? (
																		<span className="font-mono text-[#0F172A]">
																			{
																				f.atd
																			}
																		</span>
																	) : (
																		<span className="text-[#94A3B8]">
																			--
																		</span>
																	)}
																</TableCell>

																<TableCell className="py-2.5 text-center">
																	<span className="font-mono text-[#0F172A]">
																		{f.sta}
																	</span>
																</TableCell>

																<TableCell className="py-2.5 pr-5">
																	<div className="flex items-center gap-2.5">
																		<Badge
																			className={`border ${badgeClass} text-xs px-2 py-0.5`}
																		>
																			{
																				f.status
																			}
																		</Badge>
																	</div>
																</TableCell>
															</TableRow>
														);
													}
												)}

												{filteredFlights.length ===
													0 && (
													<TableRow>
														<TableCell
															colSpan={9}
															className="py-8 text-center text-[#475569]"
														>
															No records in the
															current + previous
															month window.
														</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Premium */}
						{extraCount > 0 && (
							<Card className="border border-[#D8CDB0] shadow-sm overflow-hidden bg-[#F7F4EE] py-2">
								<CardContent className="p-4">
									<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
										<div className="flex items-start gap-2.5">
											<div className="p-2.5 rounded-md bg-[#FFFFFF] text-[#0F7A6C] border border-[#D8CDB0]">
												<SparklesIcon className="h-5 w-5" />
											</div>
											<div>
												<h3 className="text-base font-semibold text-[#0F7A6C]">
													Unlock {extraCount} more{" "}
													{extraCount === 1
														? "record"
														: "records"}{" "}
													with Premium
												</h3>
												<p className="text-sm text-[#475569]">
													You&apos;re viewing{" "}
													{filteredFlights.length} of{" "}
													{searchResult?.flights
														?.length ?? 0}{" "}
													records.
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button className="bg-[#0F7A6C] hover:bg-[#2F8D7F] text-white shadow-sm h-9 px-3 rounded-md">
												Component under development
											</Button>
											<div className="hidden sm:flex items-center text-xs text-[#64748B] gap-1">
												<ShieldCheckIcon
													className="h-4 w-4"
													style={{ color: "#0F7A6C" }}
												/>
												Cancel anytime
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Column guide */}
						<div className="fixed bottom-5 right-5 z-50">
							<div className="relative">
								{showHelp && (
									<div className="absolute bottom-14 right-0 w-72 bg-[#FFFFFF] rounded-md shadow-lg border border-[#DADDE1] p-3 mb-2">
										<div className="flex items-center justify-between mb-2">
											<h3 className="font-medium text-[#0F7A6C]">
												Column Guide
											</h3>
											<button
												onClick={() =>
													setShowHelp(false)
												}
												className="text-[#94A3B8] hover:text-[#0F7A6C]"
												aria-label="Close help"
											>
												<XMarkIcon className="h-4 w-4" />
											</button>
										</div>
										<div className="space-y-1.5 text-sm">
											<div className="flex justify-between py-1 border-b border-[#DADDE1]">
												<span className="font-medium text-[#1F2937]">
													STD
												</span>
												<span className="text-[#475569]">
													Scheduled Time of Departure
												</span>
											</div>
											<div className="flex justify-between py-1 border-b border-[#DADDE1]">
												<span className="font-medium text-[#1F2937]">
													ATD
												</span>
												<span className="text-[#475569]">
													Actual Time of Departure
												</span>
											</div>
											<div className="flex justify-between py-1">
												<span className="font-medium text-[#1F2937]">
													STA
												</span>
												<span className="text-[#475569]">
													Scheduled Time of Arrival
												</span>
											</div>
										</div>
									</div>
								)}
								<button
									onClick={() => setShowHelp((v) => !v)}
									className="bg-[#0F7A6C] hover:bg-[#2F8D7F] text-white rounded-full p-3 shadow-md"
									aria-label="Toggle column guide"
								>
									<QuestionMarkCircleIcon className="h-5 w-5" />
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
