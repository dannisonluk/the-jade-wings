// FleetTable.tsx
import React from "react";
import { FleetData } from "../types";

interface FleetTableProps {
	fleet: FleetData[];
	onSort: (key: keyof FleetData) => void;
	sortConfig: { key: keyof FleetData | null; direction: "asc" | "desc" };
}

export default function FleetTable({
	fleet,
	onSort,
	sortConfig,
}: FleetTableProps) {
	const getSortIndicator = (key: keyof FleetData) => {
		if (sortConfig.key !== key) return null;
		return sortConfig.direction === "asc" ? " ▲" : " ▼";
	};

	// Alternative: Google's I'm Feeling Lucky (may show intermediate page)
	const getGoogleLuckyUrl = (registration: string) => {
		const searchQuery = `${registration} site:planespotters.net/airframe`;
		return `https://www.google.com/search?q=${encodeURIComponent(
			searchQuery
		)}&btnI=1`;
	};

	return (
		<>
			{/* Desktop Table View */}
			<div className="hidden md:block overflow-x-auto">
				<table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
					<thead className="bg-emerald-600 text-white">
						<tr>
							<th
								className="p-3 text-left cursor-pointer hover:bg-emerald-700 transition-colors"
								onClick={() => onSort("registration")}
							>
								Registration {getSortIndicator("registration")}
							</th>
							<th
								className="p-3 text-left cursor-pointer hover:bg-emerald-700 transition-colors"
								onClick={() => onSort("aircraftType")}
							>
								Aircraft Type {getSortIndicator("aircraftType")}
							</th>
							<th className="p-3 text-left">Configuration</th>
							<th
								className="p-3 text-left cursor-pointer hover:bg-emerald-700 transition-colors"
								onClick={() => onSort("deliveredDate")}
							>
								Delivered Date{" "}
								{getSortIndicator("deliveredDate")}
							</th>
							<th
								className="p-3 text-right cursor-pointer hover:bg-emerald-700 transition-colors"
								onClick={() => onSort("age")}
							>
								Age (Years) {getSortIndicator("age")}
							</th>
							<th className="p-3 text-center">Actions</th>
						</tr>
					</thead>
					<tbody>
						{fleet.map((item, index) => (
							<tr
								key={index}
								className={`${
									index % 2 === 0 ? "bg-gray-50" : "bg-white"
								} hover:bg-emerald-50 transition duration-150`}
							>
								<td className="p-3 font-medium">
									{item.registration}
								</td>
								<td className="p-3">{item.aircraftType}</td>
								<td className="p-3">{item.configuration}</td>
								<td className="p-3">{item.deliveredDate}</td>
								<td className="p-3 text-right">
									{item.age.toFixed(1)}
								</td>
								<td className="p-3 text-center">
									<a
										href={getGoogleLuckyUrl(
											item.registration
										)}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
										title="View on Planespotters"
									>
										<span>Details</span>
										<svg
											className="w-3 h-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Mobile Card View */}
			<div className="md:hidden space-y-3">
				{/* Mobile Sort Controls */}
				<div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
					<span className="text-sm font-medium text-gray-700">
						Sort by:
					</span>
					<select
						className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						value={`${sortConfig.key}_${sortConfig.direction}`}
						onChange={(e) => {
							const [key] = e.target.value.split("_");
							onSort(key as keyof FleetData);
						}}
					>
						<option value="registration_asc">
							Registration A-Z
						</option>
						<option value="registration_desc">
							Registration Z-A
						</option>
						<option value="aircraftType_asc">
							Aircraft Type A-Z
						</option>
						<option value="aircraftType_desc">
							Aircraft Type Z-A
						</option>
						<option value="age_asc">Age (Newest)</option>
						<option value="age_desc">Age (Oldest)</option>
						<option value="deliveredDate_asc">
							Delivery Date ↑
						</option>
						<option value="deliveredDate_desc">
							Delivery Date ↓
						</option>
					</select>
				</div>

				{/* Mobile Cards */}
				{fleet.map((item, index) => (
					<div
						key={index}
						className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
					>
						<div className="flex justify-between items-start mb-2">
							<div>
								<span className="text-lg font-bold text-emerald-600">
									{item.registration}
								</span>
								<div className="text-sm text-gray-600 mt-1">
									{item.aircraftType}
								</div>
							</div>
							<span className="text-xs bg-gray-100 px-2 py-1 rounded">
								<span className="text-gray-500">Config: </span>
								{item.configuration}
							</span>
						</div>
						<div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
							<div>
								<span className="text-xs text-gray-500">
									Delivered
								</span>
								<div className="text-sm font-medium">
									{item.deliveredDate}
								</div>
							</div>
							<div className="text-right">
								<span className="text-xs text-gray-500">
									Age
								</span>
								<div className="text-sm font-medium">
									{item.age.toFixed(1)} years
								</div>
							</div>
						</div>
						<div className="mt-3 pt-3 border-t border-gray-100">
							<a
								href={getGoogleLuckyUrl(item.registration)}
								target="_blank"
								rel="noopener noreferrer"
								className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
							>
								<span>View Details</span>
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
							</a>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
