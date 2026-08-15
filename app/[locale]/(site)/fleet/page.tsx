"use client";

import React, { useState } from "react";
import FleetTable from "@/features/fleet/components/FleetTable";
import FleetSummary from "@/features/fleet/components/FleetSummary";
import { FleetData, FleetSummary as FleetSummaryType } from "@/features/fleet/types";

// Import JSON data
import fleetsDataJson from "@/data/reference/fleet/fleets.json";
import fleetCountDataJson from "@/data/reference/fleet/fleet-count.json";

// Define the types for the raw JSON data
interface RawFleetData {
	REG: string;
	AIRCRAFT_TYPE: string;
	CONFIG: string;
	DELIVERED: string;
	AGE: number;
}

interface RawFleetSummary {
	aircraftType: string;
	cpaAircraftType: string;
	count: number;
	averageAge: number;
}

// Transform JSON data to match expected types
const fleetData = {
	Fleet: (fleetsDataJson.Fleet as RawFleetData[]).map((fleet) => ({
		registration: fleet.REG,
		aircraftType: fleet.AIRCRAFT_TYPE,
		configuration: fleet.CONFIG,
		deliveredDate: fleet.DELIVERED,
		age: fleet.AGE,
	})) as FleetData[],
	fleetSummary: (fleetCountDataJson.fleetSummary as RawFleetSummary[]).map(
		(summary) => ({
			aircraftType: summary.aircraftType,
			cpaAircraftType: summary.cpaAircraftType,
			count: summary.count,
			averageAge: summary.averageAge,
		})
	) as FleetSummaryType[],
};

export default function FleetPage() {
	const [filters, setFilters] = useState({
		aircraftType: "",
		minAge: 0,
		maxAge: 100,
		registration: "",
	});

	const [sortConfig, setSortConfig] = useState<{
		key: keyof FleetData | null;
		direction: "asc" | "desc";
	}>({
		key: "aircraftType", // Default sorting by Aircraft Type
		direction: "asc", // Default direction is ascending
	});

	const [isFilterExpanded, setIsFilterExpanded] = useState(false);

	// Sorting logic
	const sortFleet = (fleet: FleetData[]) => {
		if (!sortConfig.key) return fleet;

		return [...fleet].sort((a, b) => {
			const aValue = a[sortConfig.key as keyof FleetData];
			const bValue = b[sortConfig.key as keyof FleetData];

			if (typeof aValue === "string" && typeof bValue === "string") {
				return sortConfig.direction === "asc"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			}

			if (typeof aValue === "number" && typeof bValue === "number") {
				return sortConfig.direction === "asc"
					? aValue - bValue
					: bValue - aValue;
			}

			return 0;
		});
	};

	// Filtered and Sorted Fleet Data
	const filteredFleet = sortFleet(
		fleetData.Fleet.filter((fleet) => {
			const matchesAircraftType =
				!filters.aircraftType ||
				fleet.aircraftType === filters.aircraftType;
			const matchesAge =
				fleet.age >= filters.minAge && fleet.age <= filters.maxAge;
			const matchesRegistration =
				!filters.registration ||
				fleet.registration
					.toLowerCase()
					.includes(filters.registration.toLowerCase());

			return matchesAircraftType && matchesAge && matchesRegistration;
		})
	);

	const handleSort = (key: keyof FleetData) => {
		setSortConfig((prev) => ({
			key,
			direction:
				prev.key === key && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	// Check if any filters are active
	const hasActiveFilters =
		filters.aircraftType !== "" ||
		filters.minAge !== 0 ||
		filters.maxAge !== 100 ||
		filters.registration !== "";

	return (
		<div className="p-4 sm:p-6 max-w-6xl mx-auto bg-white">
			{/* Page Header */}
			<header className="mb-6 sm:mb-8 text-center">
				<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
					Fleet Information
				</h1>
				<p className="text-gray-600 text-sm sm:text-base md:text-lg px-4">
					Use the filters below to refine the fleet data
				</p>
			</header>

			{/* Fleet Summary Section */}
			<section className="mb-4 sm:mb-6 bg-white p-4 rounded-lg shadow-md border border-gray-200">
				<h2 className="text-lg sm:text-xl font-semibold text-emerald-600 mb-3 sm:mb-4">
					Fleet Summary
				</h2>
				<FleetSummary summary={fleetData.fleetSummary} />
			</section>

			{/* Filters Section - Collapsible on Mobile */}
			<section className="mb-4 sm:mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
				<div className="flex items-center justify-between">
					<h2 className="text-lg sm:text-xl font-semibold text-emerald-600">
						Filters
						{hasActiveFilters && (
							<span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
								Active
							</span>
						)}
					</h2>
					<button
						className="sm:hidden text-emerald-600 p-2"
						onClick={() => setIsFilterExpanded(!isFilterExpanded)}
					>
						<svg
							className={`w-5 h-5 transition-transform ${
								isFilterExpanded ? "rotate-180" : ""
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
				</div>

				<div
					className={`${
						isFilterExpanded ? "block" : "hidden"
					} sm:block`}
				>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
						{/* Aircraft Type Filter */}
						<div className="col-span-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Aircraft Type
							</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm sm:text-base"
								value={filters.aircraftType}
								onChange={(e) =>
									setFilters({
										...filters,
										aircraftType: e.target.value,
									})
								}
							>
								<option value="">All</option>
								{Array.from(
									new Set(
										fleetData.Fleet.map(
											(fleet) => fleet.aircraftType
										)
									)
								).map((type) => (
									<option
										key={type}
										value={type}
									>
										{type}
									</option>
								))}
							</select>
						</div>

						{/* Age Range Filter */}
						<div className="col-span-1 sm:col-span-2 md:col-span-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Age Range (Years)
							</label>
							<div className="flex items-center gap-2">
								<input
									type="number"
									className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm sm:text-base"
									placeholder="Min"
									value={filters.minAge}
									onChange={(e) =>
										setFilters({
											...filters,
											minAge: Number(e.target.value),
										})
									}
								/>
								<span className="text-gray-500">-</span>
								<input
									type="number"
									className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm sm:text-base"
									placeholder="Max"
									value={filters.maxAge}
									onChange={(e) =>
										setFilters({
											...filters,
											maxAge: Number(e.target.value),
										})
									}
								/>
							</div>
						</div>

						{/* Registration Search */}
						<div className="col-span-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Registration
							</label>
							<input
								type="text"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm sm:text-base"
								placeholder="Search by Registration"
								value={filters.registration}
								onChange={(e) =>
									setFilters({
										...filters,
										registration: e.target.value,
									})
								}
							/>
						</div>
					</div>

					{/* Clear Filters Button - Mobile Friendly */}
					{hasActiveFilters && (
						<div className="mt-4 flex justify-end">
							<button
								onClick={() =>
									setFilters({
										aircraftType: "",
										minAge: 0,
										maxAge: 100,
										registration: "",
									})
								}
								className="text-sm text-emerald-600 hover:text-emerald-700 underline"
							>
								Clear all filters
							</button>
						</div>
					)}
				</div>
			</section>

			{/* Fleet Table Section */}
			<section className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-200">
				<div className="flex items-center justify-between mb-3 sm:mb-4">
					<h2 className="text-lg sm:text-xl font-semibold text-emerald-600">
						Fleet Details
					</h2>
					<span className="text-xs sm:text-sm text-gray-500">
						{filteredFleet.length} aircraft
					</span>
				</div>

				{filteredFleet.length > 0 ? (
					<div className="overflow-x-auto -mx-3 sm:-mx-4">
						<div className="min-w-full inline-block align-middle px-3 sm:px-4">
							<FleetTable
								fleet={filteredFleet}
								onSort={handleSort}
								sortConfig={sortConfig}
							/>
						</div>
					</div>
				) : (
					<p className="text-gray-500 text-center py-8 sm:py-10 text-sm sm:text-base">
						No fleet data matches the selected filters.
					</p>
				)}
			</section>
		</div>
	);
}
