"use client";

import React, { useState, useEffect } from "react";
import { FlightSchedule } from "@/types/Schedule";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export default function SchedulePage() {
	const [data, setData] = useState<FlightSchedule[]>([]);
	const [filters, setFilters] = useState({
		origin: "",
		destination: "",
		flightNumber: "",
		departureTime: "",
		arrivalTime: "",
		cityOrCountry: "", // Unified city and country filter
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
	const [showFilters, setShowFilters] = useState(true);
	const lastUpdated = new Date(Date.UTC(2025, 8, 21));

	// Load schedule data dynamically
	useEffect(() => {
		async function loadScheduleData() {
			try {
				const scheduleFiles = ["EUR", "SWP", "SAMEA"]; // Add more region names as needed

				const promises = scheduleFiles.map(async (region) => {
					const importedData = await import(
						`@/db/json/schedule/${region}.json`
					);
					return importedData.schedule as FlightSchedule[];
				});

				const allSchedules = (await Promise.all(promises)).flat();
				setData(allSchedules);
			} catch (error) {
				console.error("Error loading schedule data:", error);
			}
		}

		loadScheduleData();
	}, []);

	const filteredData = data.filter((flight) => {
		// Check operating days
		const daysMatch = Object.keys(filters.operatingDays).some(
			(day) =>
				filters.operatingDays[
					day as keyof typeof filters.operatingDays
				] &&
				flight.operatingDays[day as keyof typeof filters.operatingDays]
		);

		// Check city or country
		const cityOrCountryMatch =
			!filters.cityOrCountry ||
			flight.city
				.toLowerCase()
				.includes(filters.cityOrCountry.toLowerCase()) ||
			flight.country
				.toLowerCase()
				.includes(filters.cityOrCountry.toLowerCase());

		return (
			(!filters.origin || flight.origin.includes(filters.origin)) &&
			(!filters.destination ||
				flight.destination.includes(filters.destination)) &&
			(!filters.flightNumber ||
				flight.flightNumber.includes(filters.flightNumber)) &&
			(!filters.departureTime ||
				flight.departureTime.includes(filters.departureTime)) &&
			(!filters.arrivalTime ||
				flight.arrivalTime.includes(filters.arrivalTime)) &&
			cityOrCountryMatch && // Unified city or country filter
			(Object.values(filters.operatingDays).every((day) => !day) ||
				daysMatch)
		);
	});

	// Date Format Options
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	return (
		<div className="p-4 sm:p-6 max-w-4xl mx-auto">
			{/* Page Header */}
			<header className="mb-6 text-center">
				<h1 className="text-2xl sm:text-4xl font-bold text-emerald-600 mb-2">
					Flight Schedule
				</h1>
				<p className="text-sm sm:text-lg text-gray-600">
					Last Updated:{" "}
					{lastUpdated
						? lastUpdated.toLocaleDateString("en-HK", options)
						: "Loading..."}
				</p>
			</header>

			{/* Filters Section */}
			<section className="mb-6">
				{/* Collapsible Filters */}
				<button
					className="w-full flex justify-between items-center bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg shadow-md sm:hidden"
					onClick={() => setShowFilters(!showFilters)}
				>
					<span className="font-medium">Filters</span>
					{showFilters ? (
						<ChevronUpIcon className="h-5 w-5" />
					) : (
						<ChevronDownIcon className="h-5 w-5" />
					)}
				</button>
				{showFilters && (
					<div className="mt-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
						{/* Search Filters */}
						<div className="flex flex-col gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Origin
								</label>
								<input
									type="text"
									placeholder="Enter Origin Airport"
									value={filters.origin}
									onChange={(e) =>
										setFilters((prev) => ({
											...prev,
											origin: e.target.value,
										}))
									}
									className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-emerald-400 w-full"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Destination
								</label>
								<input
									type="text"
									placeholder="Enter Destination Airport"
									value={filters.destination}
									onChange={(e) =>
										setFilters((prev) => ({
											...prev,
											destination: e.target.value,
										}))
									}
									className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-emerald-400 w-full"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									City or Country
								</label>
								<input
									type="text"
									placeholder="Enter City or Country"
									value={filters.cityOrCountry}
									onChange={(e) =>
										setFilters((prev) => ({
											...prev,
											cityOrCountry: e.target.value,
										}))
									}
									className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-emerald-400 w-full"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Flight Number
								</label>
								<input
									type="text"
									placeholder="Enter Flight Number"
									value={filters.flightNumber}
									onChange={(e) =>
										setFilters((prev) => ({
											...prev,
											flightNumber: e.target.value,
										}))
									}
									className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-emerald-400 w-full"
								/>
							</div>

							<div className="flex gap-4">
								<div className="flex-1">
									<label className="block text-sm font-medium text-gray-700">
										Departure Time
									</label>
									<input
										type="time"
										value={filters.departureTime}
										onChange={(e) =>
											setFilters((prev) => ({
												...prev,
												departureTime: e.target.value,
											}))
										}
										className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-emerald-400 w-full"
									/>
								</div>
								<div className="flex-1">
									<label className="block text-sm font-medium text-gray-700">
										Arrival Time
									</label>
									<input
										type="time"
										value={filters.arrivalTime}
										onChange={(e) =>
											setFilters((prev) => ({
												...prev,
												arrivalTime: e.target.value,
											}))
										}
										className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-emerald-400 w-full"
									/>
								</div>
							</div>

							{/* Operating Days */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Operating Days
								</label>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
									{Object.keys(filters.operatingDays).map(
										(day) => (
											<div
												key={day}
												className="flex items-center gap-2"
											>
												<input
													type="checkbox"
													id={day}
													checked={
														filters.operatingDays[
															day as keyof typeof filters.operatingDays
														]
													}
													onChange={(e) =>
														setFilters((prev) => ({
															...prev,
															operatingDays: {
																...prev.operatingDays,
																[day]: e.target
																	.checked,
															},
														}))
													}
													className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
												/>
												<label
													htmlFor={day}
													className="capitalize text-gray-700"
												>
													{day}
												</label>
											</div>
										)
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</section>

			{/* Results Section */}
			<section>
				{filteredData.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{filteredData.map((flight, index) => (
							<div
								key={index}
								className="relative border p-4 rounded-lg shadow-md bg-white"
							>
								{/* Country and City Details in Top-Right */}
								<div className="absolute top-4 right-4 text-right">
									<p className="text-gray-600">
										<span className="font-medium">
											Country:
										</span>{" "}
										{flight.country}
									</p>
									<p className="text-gray-600">
										<span className="font-medium">
											City:
										</span>{" "}
										{flight.city}
									</p>
								</div>

								{/* Departure and Arrival Information */}
								<h3 className="text-lg font-bold text-emerald-600">
									Departure: {flight.origin}
								</h3>
								<h3 className="text-lg font-bold text-emerald-600">
									Arrival: {flight.destination}
								</h3>

								{/* Flight Details */}
								<p className="text-gray-600 mt-2">
									Flight Number:{" "}
									<span className="font-medium">
										CX {flight.flightNumber}
									</span>
								</p>
								<p className="text-gray-600">
									Departure:{" "}
									<span className="font-medium">
										{flight.departureTime}
									</span>
								</p>
								<p className="text-gray-600">
									Arrival:{" "}
									<span className="font-medium">
										{flight.arrivalTime}
									</span>
								</p>

								{/* Operating Days Table */}
								<div className="mt-4">
									<table className="w-full border-collapse text-center table-fixed">
										<thead>
											<tr className="bg-emerald-600 text-white">
												<th className="p-2 w-[14.28%]">
													Sun
												</th>
												<th className="p-2 w-[14.28%]">
													Mon
												</th>
												<th className="p-2 w-[14.28%]">
													Tue
												</th>
												<th className="p-2 w-[14.28%]">
													Wed
												</th>
												<th className="p-2 w-[14.28%]">
													Thu
												</th>
												<th className="p-2 w-[14.28%]">
													Fri
												</th>
												<th className="p-2 w-[14.28%]">
													Sat
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												{Object.keys(
													flight.operatingDays
												).map((day, dayIndex) => (
													<td
														key={dayIndex}
														className={`p-2 ${
															dayIndex % 2 === 0
																? "bg-gray-100"
																: "bg-white"
														}`}
													>
														{flight.operatingDays[
															day as keyof typeof flight.operatingDays
														] ? (
															<span className="text-emerald-600 font-bold">
																✔
															</span>
														) : (
															<span className="text-gray-400">
																--
															</span>
														)}
													</td>
												))}
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-center text-gray-500">
						No flights match your criteria.
					</p>
				)}
			</section>
		</div>
	);
}
