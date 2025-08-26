// FleetSummary.tsx
import React from "react";
import { FleetSummary as FleetSummaryType } from "@/types/Fleet";

interface FleetSummaryProps {
	summary: FleetSummaryType[];
}

export default function FleetSummary({ summary }: FleetSummaryProps) {
	// Calculate totals
	const totalAircraft = summary.reduce((sum, item) => sum + item.count, 0);
	const weightedAgeSum = summary.reduce(
		(sum, item) => sum + item.averageAge * item.count,
		0
	);
	const overallAverageAge =
		totalAircraft > 0 ? weightedAgeSum / totalAircraft : 0;

	return (
		<>
			{/* Desktop Table View */}
			<div className="hidden sm:block overflow-x-auto">
				<table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
					<thead className="bg-emerald-600 text-white">
						<tr>
							<th className="p-3 text-left">Aircraft Type</th>
							<th className="p-3 text-left">CX Aircraft Type</th>
							<th className="p-3 text-right">Count</th>
							<th className="p-3 text-right">Average Age</th>
						</tr>
					</thead>
					<tbody>
						{summary.map((item, index) => (
							<tr
								key={index}
								className={`${
									index % 2 === 0 ? "bg-gray-50" : "bg-white"
								} hover:bg-emerald-50 transition duration-150`}
							>
								<td className="p-3 font-medium">
									{item.aircraftType}
								</td>
								<td className="p-3">{item.cpaAircraftType}</td>
								<td className="p-3 text-right font-medium">
									{item.count}
								</td>
								<td className="p-3 text-right">
									{item.averageAge.toFixed(1)} years
								</td>
							</tr>
						))}
						{/* Total Row */}
						<tr className="bg-emerald-50 font-bold border-t-2 border-emerald-600">
							<td
								className="p-3"
								colSpan={2}
							>
								Total Fleet
							</td>
							<td className="p-3 text-right">{totalAircraft}</td>
							<td className="p-3 text-right">
								{overallAverageAge.toFixed(1)} years
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* Mobile Card View */}
			<div className="sm:hidden">
				{/* Summary Stats */}
				<div className="grid grid-cols-2 gap-3 mb-4">
					<div className="bg-emerald-50 rounded-lg p-3 text-center">
						<div className="text-2xl font-bold text-emerald-600">
							{totalAircraft}
						</div>
						<div className="text-xs text-gray-600">
							Total Aircraft
						</div>
					</div>
					<div className="bg-emerald-50 rounded-lg p-3 text-center">
						<div className="text-2xl font-bold text-emerald-600">
							{overallAverageAge.toFixed(1)}
						</div>
						<div className="text-xs text-gray-600">
							Avg Age (Years)
						</div>
					</div>
				</div>

				{/* Aircraft Type Cards */}
				<div className="space-y-3">
					{summary.map((item, index) => (
						<div
							key={index}
							className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
						>
							<div className="flex justify-between items-start mb-2">
								<div>
									<div className="font-bold text-emerald-600">
										{item.aircraftType}
									</div>
									<div className="text-sm text-gray-600">
										{item.cpaAircraftType}
									</div>
								</div>
								<div className="text-right">
									<div className="text-xl font-bold">
										{item.count}
									</div>
									<div className="text-xs text-gray-500">
										aircraft
									</div>
								</div>
							</div>
							<div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
								<span className="text-xs text-gray-500">
									Average Age
								</span>
								<span className="text-sm font-medium">
									{item.averageAge.toFixed(1)} years
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}
