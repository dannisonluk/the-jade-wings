"use client";

import { useEffect, useMemo, useState } from "react";
import {
	ArrowRight,
	CalendarDays,
	CircleAlert,
	Clock3,
	Plane,
	Search,
	SlidersHorizontal,
	X,
} from "lucide-react";

import {
	OPERATING_DAYS,
	type FlightSchedule,
	type OperatingDay,
	type ScheduleDataset,
} from "@/types/Schedule";

const DAY_LABELS: Record<OperatingDay, string> = {
	sunday: "Sun",
	monday: "Mon",
	tuesday: "Tue",
	wednesday: "Wed",
	thursday: "Thu",
	friday: "Fri",
	saturday: "Sat",
};

type Filters = {
	date: string;
	origin: string;
	destination: string;
	flightNumber: string;
	region: string;
	bodyType: string;
	days: OperatingDay[];
};

const PAGE_SIZE = 60;

function normalize(value: string): string {
	return value.toLowerCase().trim();
}

function formatDate(value: string): string {
	if (!value) return "Unknown";
	return new Intl.DateTimeFormat("en-HK", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "Asia/Hong_Kong",
	}).format(new Date(value.length === 10 ? `${value}T00:00:00+08:00` : value));
}

function formatTime(time: string, offset: number): string {
	if (offset === 0) return time;
	return `${time} ${offset > 0 ? "+" : ""}${offset}`;
}

function dayForDate(value: string): OperatingDay | null {
	if (!value) return null;
	return OPERATING_DAYS[new Date(`${value}T12:00:00Z`).getUTCDay()] ?? null;
}

function ScheduleCard({ flight }: { flight: FlightSchedule }) {
	return (
		<article className="border-b border-slate-200 bg-white px-4 py-5 last:border-b-0 sm:px-6">
			<div className="flex items-start justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#006564] text-white">
						<Plane className="h-4 w-4" aria-hidden="true" />
					</span>
					<div>
						<p className="text-xs font-medium uppercase text-slate-500">
							{flight.bodyType} · {flight.aircraftType}
						</p>
						<h2 className="text-base font-semibold text-slate-950">
							{flight.carrier} {flight.flightNumber}
						</h2>
					</div>
				</div>
				<span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
					{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
				</span>
			</div>

			<div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
				<div>
					<p className="text-2xl font-semibold text-slate-950">
						{formatTime(flight.departureTime, flight.departureDayOffset)}
					</p>
					<p className="mt-0.5 text-sm font-medium text-slate-600">
						{flight.origin}
					</p>
				</div>
				<div className="flex items-center gap-2 text-slate-400">
					<span className="h-px w-5 bg-slate-300 sm:w-10" />
					<ArrowRight className="h-4 w-4" aria-hidden="true" />
					<span className="h-px w-5 bg-slate-300 sm:w-10" />
				</div>
				<div className="text-right">
					<p className="text-2xl font-semibold text-slate-950">
						{formatTime(flight.arrivalTime, flight.arrivalDayOffset)}
					</p>
					<p className="mt-0.5 text-sm font-medium text-slate-600">
						{flight.destination}
					</p>
				</div>
			</div>

			<div className="mt-5 border-t border-slate-100 pt-4">
				<div className="flex flex-wrap items-center gap-2">
					{/* <CalendarDays className="mr-1 h-4 w-4 text-slate-400" aria-hidden="true" /> */}
					{OPERATING_DAYS.map((day) => (
						<span
							key={day}
							className={`inline-flex h-7 min-w-9 items-center justify-center rounded-md px-2 text-xs font-medium ${
								flight.operatingDays[day]
									? "bg-emerald-50 text-emerald-800"
									: "bg-slate-50 text-slate-300"
							}`}
						>
							{DAY_LABELS[day]}
						</span>
					))}
				</div>
				<div className="mt-3 grid gap-1 text-xs text-slate-500 sm:grid-cols-[1fr_auto]">
					<p className="truncate">{flight.fullItinerary}</p>
					<p>{formatDate(flight.validFrom)} - {formatDate(flight.validTo)}</p>
				</div>
			</div>
		</article>
	);
}

export function ScheduleExplorer({ dataset }: { dataset: ScheduleDataset }) {
	const firstDate = dataset.meta.provenance.effectiveFrom ?? "";
	const emptyFilters = useMemo<Filters>(() => ({
		date: firstDate,
		origin: "",
		destination: "",
		flightNumber: "",
		region: "",
		bodyType: "",
		days: [],
	}), [firstDate]);
	const [filters, setFilters] = useState<Filters>(emptyFilters);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	const airports = useMemo(
		() => [...new Set(dataset.schedule.flatMap((row) => [row.origin, row.destination]))].sort(),
		[dataset.schedule],
	);
	const bodyTypes = useMemo(
		() => [...new Set(dataset.schedule.map((row) => row.bodyType))].sort(),
		[dataset.schedule],
	);

	const results = useMemo(() => {
		const flightQuery = normalize(filters.flightNumber).replace(/\s+/g, "");
		const selectedDateDay = dayForDate(filters.date);
		return dataset.schedule.filter((flight) => {
			const flightCode = normalize(`${flight.carrier}${flight.flightNumber}`);
			return (
				(!filters.origin || normalize(flight.origin).includes(normalize(filters.origin))) &&
				(!filters.destination || normalize(flight.destination).includes(normalize(filters.destination))) &&
				(!flightQuery || flightCode.includes(flightQuery)) &&
				(!filters.region || flight.originRegion === filters.region || flight.destinationRegion === filters.region) &&
				(!filters.bodyType || flight.bodyType === filters.bodyType) &&
				(!filters.date || (
					flight.validFrom <= filters.date &&
					flight.validTo >= filters.date &&
					selectedDateDay !== null &&
					flight.operatingDays[selectedDateDay]
				)) &&
				(filters.days.length === 0 || filters.days.some((day) => flight.operatingDays[day]))
			);
		});
	}, [dataset.schedule, filters]);

	useEffect(() => setVisibleCount(PAGE_SIZE), [filters]);

	const hasFilters = JSON.stringify(filters) !== JSON.stringify(emptyFilters);
	const errorCount = dataset.meta.issues.filter((issue) => issue.severity === "error").length;
	const toggleDay = (day: OperatingDay) => {
		setFilters((current) => ({
			...current,
			days: current.days.includes(day)
				? current.days.filter((item) => item !== day)
				: [...current.days, day],
		}));
	};

	return (
		<main className="min-h-screen bg-[#f4f6f5] text-slate-950">
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
					<div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
						<div>
							<p className="text-sm font-medium text-[#006564]">Cargo timetable</p>
							<h1 className="mt-1 text-3xl font-semibold text-slate-950 sm:text-4xl">
								Cathay Cargo flight schedule
							</h1>
							<p className="mt-2 text-sm text-slate-500">{dataset.meta.schedulePeriod}</p>
						</div>
						<div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
							<span className="inline-flex items-center gap-2">
								<Clock3 className="h-4 w-4" aria-hidden="true" />
								Correct as of {dataset.meta.provenance.retrievedAt ? formatDate(dataset.meta.provenance.retrievedAt) : "unknown"}
							</span>
							<span>{dataset.meta.recordCount.toLocaleString()} schedule rows</span>
						</div>
					</div>
				</div>
			</header>

			<div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
				{errorCount > 0 && (
					<div className="mb-5 flex gap-3 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-950">
						<CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
						<p>{errorCount} invalid workbook row{errorCount === 1 ? " was" : "s were"} excluded.</p>
					</div>
				)}

				<section className="border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Schedule filters">
					<div className="grid gap-3 md:grid-cols-[0.9fr_1fr_auto_1fr_0.8fr_auto] md:items-end">
						<label className="block">
							<span className="text-xs font-semibold uppercase text-slate-500">Travel date</span>
							<input
								type="date"
								min={dataset.meta.provenance.effectiveFrom ?? undefined}
								max={dataset.meta.provenance.effectiveTo ?? undefined}
								value={filters.date}
								onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
								className="mt-1.5 h-11 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#006564] focus:ring-2 focus:ring-[#006564]/15"
							/>
						</label>
						<label className="block">
							<span className="text-xs font-semibold uppercase text-slate-500">From</span>
							<input
								list="schedule-airports"
								value={filters.origin}
								onChange={(event) => setFilters((current) => ({ ...current, origin: event.target.value.toUpperCase() }))}
								placeholder="HKG"
								className="mt-1.5 h-11 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#006564] focus:ring-2 focus:ring-[#006564]/15"
							/>
						</label>
						<ArrowRight className="mb-3 hidden h-4 w-4 text-slate-400 md:block" aria-hidden="true" />
						<label className="block">
							<span className="text-xs font-semibold uppercase text-slate-500">To</span>
							<input
								list="schedule-airports"
								value={filters.destination}
								onChange={(event) => setFilters((current) => ({ ...current, destination: event.target.value.toUpperCase() }))}
								placeholder="NRT"
								className="mt-1.5 h-11 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#006564] focus:ring-2 focus:ring-[#006564]/15"
							/>
						</label>
						<label className="block">
							<span className="text-xs font-semibold uppercase text-slate-500">Flight</span>
							<div className="relative mt-1.5">
								<Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
								<input
									value={filters.flightNumber}
									onChange={(event) => setFilters((current) => ({ ...current, flightNumber: event.target.value }))}
									placeholder="CX006"
									className="h-11 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#006564] focus:ring-2 focus:ring-[#006564]/15"
								/>
							</div>
						</label>
						<button
							type="button"
							onClick={() => setShowAdvanced((value) => !value)}
							aria-expanded={showAdvanced}
							className="inline-flex h-11 items-center justify-center gap-2 border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
						>
							<SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> More
						</button>
					</div>

					<datalist id="schedule-airports">
						{airports.map((code) => <option key={code} value={code} />)}
					</datalist>

					{showAdvanced && (
						<div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
							<label>
								<span className="text-xs font-semibold uppercase text-slate-500">Region</span>
								<select value={filters.region} onChange={(event) => setFilters((current) => ({ ...current, region: event.target.value }))} className="mt-1.5 h-10 w-full border border-slate-300 bg-white px-3 text-sm">
									<option value="">All regions</option>
									{dataset.meta.regions.map((region) => <option key={region} value={region}>{region}</option>)}
								</select>
							</label>
							<label>
								<span className="text-xs font-semibold uppercase text-slate-500">Aircraft body</span>
								<select value={filters.bodyType} onChange={(event) => setFilters((current) => ({ ...current, bodyType: event.target.value }))} className="mt-1.5 h-10 w-full border border-slate-300 bg-white px-3 text-sm">
									<option value="">All body types</option>
									{bodyTypes.map((bodyType) => <option key={bodyType} value={bodyType}>{bodyType}</option>)}
								</select>
							</label>
							<div className="flex flex-wrap gap-2 sm:col-span-2">
								{OPERATING_DAYS.map((day) => (
									<button type="button" key={day} onClick={() => toggleDay(day)} aria-pressed={filters.days.includes(day)} className={`h-9 min-w-12 border px-3 text-sm font-medium ${filters.days.includes(day) ? "border-[#006564] bg-[#006564] text-white" : "border-slate-300 bg-white text-slate-700"}`}>
										{DAY_LABELS[day]}
									</button>
								))}
							</div>
						</div>
					)}
				</section>

				<div className="mt-6 flex items-center justify-between gap-4">
					<p className="text-sm text-slate-600"><span className="font-semibold text-slate-950">{results.length.toLocaleString()}</span> matching schedule rows</p>
					{hasFilters && (
						<button type="button" onClick={() => setFilters(emptyFilters)} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#006564]">
							<X className="h-4 w-4" aria-hidden="true" /> Reset filters
						</button>
					)}
				</div>

				<section className="mt-3 overflow-hidden border border-slate-200 shadow-sm">
					{results.length > 0 ? (
						<div className="grid lg:grid-cols-2 lg:[&>*:nth-child(odd)]:border-r">
							{results.slice(0, visibleCount).map((flight) => (
								<ScheduleCard
									key={`${flight.carrier}${flight.flightNumber}-${flight.pair}-${flight.fullItinerary}-${flight.validFrom}-${flight.validTo}-${flight.departureTime}-${flight.arrivalTime}-${flight.aircraftType}-${JSON.stringify(flight.operatingDays)}`}
									flight={flight}
								/>
							))}
						</div>
					) : (
						<div className="bg-white px-6 py-14 text-center">
							<Plane className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
							<p className="mt-3 font-medium text-slate-900">No matching service</p>
							<p className="mt-1 text-sm text-slate-500">Try another date, airport or flight number.</p>
						</div>
					)}
				</section>
				{visibleCount < results.length && (
					<button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="mt-4 h-11 w-full border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
						Show more ({(results.length - visibleCount).toLocaleString()} remaining)
					</button>
				)}
				<p className="mt-5 text-xs leading-5 text-slate-500">{dataset.meta.disclaimer}</p>
			</div>
		</main>
	);
}
