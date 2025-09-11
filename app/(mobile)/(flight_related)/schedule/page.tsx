"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FlightSchedule } from "@/types/Schedule";
import {
	ChevronDownIcon,
	ChevronUpIcon,
	ArrowRightIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";

export default function SchedulePage() {
	const [data, setData] = useState<FlightSchedule[]>([]);
	const [filters, setFilters] = useState({
		origin: "",
		destination: "",
		flightNumber: "",
		departureTime: "",
		arrivalTime: "",
		cityOrCountry: "",
		operatingDays: {
			sunday: false,
			monday: false,
			tuesday: false,
			wednesday: false,
			thursday: false,
			friday: false,
			saturday: false,
		},
	});

	// Advanced hidden by default
	const [showAdvanced, setShowAdvanced] = useState(false);

	const lastUpdated = new Date(Date.UTC(2025, 8, 21));

	useEffect(() => {
		async function loadScheduleData() {
			try {
				const scheduleFiles = ["EUR", "SWP", "SAMEA", "SEA"];
				const all = (
					await Promise.all(
						scheduleFiles.map(async (region) => {
							const imported = await import(
								`@/db/json/schedule/${region}.json`
							);
							return imported.schedule as FlightSchedule[];
						})
					)
				).flat();
				setData(all);
			} catch (err) {
				console.error("Error loading schedule data:", err);
			}
		}
		loadScheduleData();
	}, []);

	const clearFilters = () =>
		setFilters({
			origin: "",
			destination: "",
			flightNumber: "",
			departureTime: "",
			arrivalTime: "",
			cityOrCountry: "",
			operatingDays: {
				sunday: false,
				monday: false,
				tuesday: false,
				wednesday: false,
				thursday: false,
				friday: false,
				saturday: false,
			},
		});

	// Normalize for case-insensitive compare
	const norm = (s: string) => (s || "").toLowerCase().trim();

	// Format to HH:MM regardless of “:ss” or HHMM
	const formatTime = (value: string) => {
		if (!value) return "";
		let v = value.trim();
		if (/^\d{3,4}$/.test(v)) {
			v = v.padStart(4, "0");
			return `${v.slice(0, 2)}:${v.slice(2, 4)}`;
		}
		const m = v.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
		if (m) {
			const hh = m[1].padStart(2, "0");
			const mm = m[2];
			return `${hh}:${mm}`;
		}
		return v;
	};

	// Matchers for From/To that accept airport code, city, or country
	const matchesOrigin = (flight: FlightSchedule, q: string) => {
		if (!q) return true;
		const query = norm(q);
		return (
			norm(flight.origin).includes(query) ||
			norm(flight.city).includes(query) ||
			norm(flight.country).includes(query)
		);
	};

	const matchesDestination = (flight: FlightSchedule, q: string) => {
		if (!q) return true;
		const query = norm(q);
		// If your data has destination city/country, use those. If not, we can still
		// match against flight.city/country when destination equals that location.
		// Assuming your JSON rows describe the destination city/country as city/country:
		return (
			norm(flight.destination).includes(query) ||
			norm(flight.city).includes(query) ||
			norm(flight.country).includes(query)
		);
	};

	// Update the filtering logic to handle pattern-based flights
	const filteredData = useMemo(() => {
		return data.filter((flight) => {
			// For pattern-based flights (e.g., every 2 days),
			// skip the operating days check if no day filter is selected
			const hasPattern = flight.pattern;
			const isDayFilterActive = Object.values(filters.operatingDays).some(
				(d) => d
			);

			const daysMatch =
				hasPattern && !isDayFilterActive
					? true // If it has a pattern and no day filter is active, include it
					: Object.keys(filters.operatingDays).some(
							(day) =>
								filters.operatingDays[
									day as keyof typeof filters.operatingDays
								] &&
								flight.operatingDays[
									day as keyof typeof filters.operatingDays
								]
					  );

			const unifiedCityCountry =
				!filters.cityOrCountry ||
				norm(flight.city).includes(norm(filters.cityOrCountry)) ||
				norm(flight.country).includes(norm(filters.cityOrCountry));

			return (
				matchesOrigin(flight, filters.origin) &&
				matchesDestination(flight, filters.destination) &&
				(!filters.flightNumber ||
					flight.flightNumber
						.toString()
						.includes(filters.flightNumber)) &&
				(!filters.departureTime ||
					formatTime(flight.departureTime) ===
						formatTime(filters.departureTime)) &&
				(!filters.arrivalTime ||
					formatTime(flight.arrivalTime) ===
						formatTime(filters.arrivalTime)) &&
				unifiedCityCountry &&
				(Object.values(filters.operatingDays).every((d) => !d) ||
					daysMatch)
			);
		});
	}, [data, filters]);

	// Helper function to render pattern description
	const getPatternDescription = (pattern: string | undefined) => {
		if (!pattern) return null;

		const patterns: Record<string, string> = {
			"1|2": "Every 2 days",
			"1|3": "Every 3 days",
			"1|7": "Weekly",
			// Add more patterns as needed
		};

		return patterns[pattern] || `Pattern: ${pattern}`;
	};

	const dateFmt: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	return (
		<main className="min-h-screen bg-whtie">
			<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 bg-white">
				{/* Header */}
				<header className="py-6 sm:py-10 lg:py-12 text-center">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
						Flight Schedule
					</h1>
					<p className="mt-2 text-sm sm:text-base text-slate-600">
						Last updated: 31 August 2025
						{/* Last updated:{" "}
						{lastUpdated.toLocaleDateString("en-HK", dateFmt)} */}
					</p>
					<p className="mt-2 text-xs sm:text-sm text-emerald-700">
						Only regions EUR, SAMEA, SEA and SWP are available.
					</p>
				</header>

				{/* Primary search row */}
				<section className="mb-6">
					<div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
							{/* From */}
							<div className="sm:col-span-4">
								<label className="block text-sm font-medium text-slate-700">
									From
								</label>
								<div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500">
									<span
										aria-hidden
										className="text-slate-500"
									>
										✈️
									</span>
									<input
										type="text"
										placeholder="HKG or Hong Kong"
										value={filters.origin}
										onChange={(e) =>
											setFilters((p) => ({
												...p,
												origin: e.target.value,
											}))
										}
										className="w-full bg-transparent outline-none placeholder:text-slate-400"
									/>
								</div>
							</div>

							{/* Arrow */}
							<div className="hidden sm:flex sm:col-span-1 justify-center pb-1">
								<ArrowRightIcon className="h-6 w-6 text-slate-400" />
							</div>

							{/* To */}
							<div className="sm:col-span-4">
								<label className="block text-sm font-medium text-slate-700">
									To
								</label>
								<div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500">
									<span
										aria-hidden
										className="text-slate-500"
									>
										🛬
									</span>
									<input
										type="text"
										placeholder="LHR or UNITED KINGDOM"
										value={filters.destination}
										onChange={(e) =>
											setFilters((p) => ({
												...p,
												destination: e.target.value,
											}))
										}
										className="w-full bg-transparent outline-none placeholder:text-slate-400"
									/>
								</div>
							</div>

							{/* Flight number */}
							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-slate-700">
									Flight No.
								</label>
								<input
									type="text"
									placeholder="123"
									value={filters.flightNumber}
									onChange={(e) =>
										setFilters((p) => ({
											...p,
											flightNumber: e.target.value,
										}))
									}
									className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								/>
							</div>

							{/* Unified City/Country filter (optional keep) */}
							<div className="sm:col-span-10">
								<label className="block text-sm font-medium text-slate-700">
									City or Country (Non-HK Origin/Destination)
								</label>
								<input
									type="text"
									placeholder="City or Country name"
									value={filters.cityOrCountry}
									onChange={(e) =>
										setFilters((p) => ({
											...p,
											cityOrCountry: e.target.value,
										}))
									}
									className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
								/>
							</div>

							{/* Clear */}
							<div className="sm:col-span-2">
								<button
									onClick={clearFilters}
									className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm hover:bg-slate-50"
								>
									<XMarkIcon className="h-5 w-5" />
									Clear
								</button>
							</div>
						</div>
					</div>
				</section>

				{/* Advanced filters (hidden by default on all breakpoints) */}
				<section className="mb-8">
					<button
						className="w-full flex justify-between items-center bg-emerald-50 text-emerald-800 px-4 py-2 rounded-lg border border-emerald-100 shadow-sm"
						onClick={() => setShowAdvanced((s) => !s)}
					>
						<span className="font-medium">Advanced Filters</span>
						{showAdvanced ? (
							<ChevronUpIcon className="h-5 w-5" />
						) : (
							<ChevronDownIcon className="h-5 w-5" />
						)}
					</button>

					<div
						className={`mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm transition-[grid-template-rows] duration-300 [display:grid] ${
							showAdvanced
								? "[grid-template-rows:1fr]"
								: "[grid-template-rows:0fr]"
						}`}
					>
						<div className="min-h-0 overflow-hidden">
							<div className="p-4 sm:p-6">
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
									{/* Times */}
									{/* <div className="grid grid-cols-2 gap-4 sm:col-span-1">
										<div>
											<label className="block text-sm font-medium text-slate-700">
												Departure Time
											</label>
											<input
												type="time"
												value={filters.departureTime}
												onChange={(e) =>
													setFilters((p) => ({
														...p,
														departureTime:
															e.target.value,
													}))
												}
												className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700">
												Arrival Time
											</label>
											<input
												type="time"
												value={filters.arrivalTime}
												onChange={(e) =>
													setFilters((p) => ({
														...p,
														arrivalTime:
															e.target.value,
													}))
												}
												className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
										</div>
									</div> */}

									{/* Operating days */}
									<div className="sm:col-span-2">
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Operating Days
										</label>
										<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
											{Object.keys(
												filters.operatingDays
											).map((day) => (
												<label
													key={day}
													className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2"
												>
													<input
														type="checkbox"
														checked={
															filters
																.operatingDays[
																day as keyof typeof filters.operatingDays
															]
														}
														onChange={(e) =>
															setFilters(
																(prev) => ({
																	...prev,
																	operatingDays:
																		{
																			...prev.operatingDays,
																			[day]: e
																				.target
																				.checked,
																		},
																})
															)
														}
														className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
													/>
													<span className="capitalize text-slate-700">
														{day}
													</span>
												</label>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Results */}
				<section className="pb-12 sm:pb-16">
					{filteredData.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
							{filteredData.map((flight, idx) => (
								<article
									key={idx}
									className="relative rounded-2xl border border-slate-200 bg-white shadow-sm"
								>
									<div className="p-4 sm:p-5">
										{/* Header block */}
										<div className="relative">
											<div className="absolute right-0 top-1/2 -translate-y-1/2 max-w-[60%] rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-left">
												<p className="text-xs sm:text-sm text-slate-600">
													<span className="font-medium">
														Country:
													</span>{" "}
													{flight.country}
												</p>
												<p className="text-xs sm:text-sm text-slate-600">
													<span className="font-medium">
														City:
													</span>{" "}
													{flight.city}
												</p>
											</div>

											<div className="pr-[40%]">
												<h3 className="text-lg font-semibold text-slate-900">
													CX {flight.flightNumber}
												</h3>
												<div className="text-emerald-700 font-medium">
													{flight.origin} →{" "}
													{flight.destination}
												</div>
											</div>
										</div>

										{/* Times */}
										<dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
											<div>
												<dt className="text-slate-500">
													Departure
												</dt>
												<dd className="font-medium text-slate-900">
													{formatTime(
														flight.departureTime
													)}
												</dd>
											</div>
											<div>
												<dt className="text-slate-500">
													Arrival
												</dt>
												<dd className="font-medium text-slate-900">
													{formatTime(
														flight.arrivalTime
													)}
												</dd>
											</div>
										</dl>

										{/* Operating days or Pattern display */}
										{flight.pattern ? (
											// Show pattern information for special flights
											<div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
												<p className="text-sm font-medium text-amber-900">
													Schedule:{" "}
													{getPatternDescription(
														flight.pattern
													)}
												</p>
												<p className="text-xs text-amber-700 mt-1">
													This flight operates on a
													special schedule pattern
												</p>
											</div>
										) : (
											// Show regular operating days table
											<div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
												<table className="w-full border-collapse text-center">
													<thead>
														<tr className="bg-emerald-600 text-white text-xs sm:text-sm">
															{[
																"Sun",
																"Mon",
																"Tue",
																"Wed",
																"Thu",
																"Fri",
																"Sat",
															].map((d) => (
																<th
																	key={d}
																	className="p-2"
																>
																	{d}
																</th>
															))}
														</tr>
													</thead>
													<tbody>
														<tr>
															{Object.keys(
																flight.operatingDays
															).map((day, i) => (
																<td
																	key={day}
																	className={`p-2 text-sm ${
																		i %
																			2 ===
																		0
																			? "bg-slate-50"
																			: "bg-white"
																	}`}
																>
																	{flight
																		.operatingDays[
																		day as keyof typeof flight.operatingDays
																	] ? (
																		<span className="text-emerald-700 font-semibold">
																			✔
																		</span>
																	) : (
																		<span className="text-slate-400">
																			--
																		</span>
																	)}
																</td>
															))}
														</tr>
													</tbody>
												</table>
											</div>
										)}
									</div>
								</article>
							))}
						</div>
					) : (
						<p className="text-center text-slate-500">
							No flights match your criteria.
						</p>
					)}
				</section>
			</div>
		</main>
	);
}
