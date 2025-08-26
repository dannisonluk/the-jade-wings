import React from "react";
import { FlightSchedule } from "@/types/Schedule";

interface ScheduleTableProps {
	schedule: FlightSchedule[];
}

// Type-safe array for full weekday names
const fullWeekdays: (keyof FlightSchedule["operatingDays"])[] = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
];

// Map full weekday names to abbreviations
const weekdayMap: { [key in keyof FlightSchedule["operatingDays"]]: string } = {
	sunday: "Sun",
	monday: "Mon",
	tuesday: "Tue",
	wednesday: "Wed",
	thursday: "Thu",
	friday: "Fri",
	saturday: "Sat",
};

export default function ScheduleTable({ schedule }: ScheduleTableProps) {
	return (
		<table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
			<thead className="bg-emerald-600 text-white">
				<tr>
					<th className="p-3 text-left">Orig</th>
					<th className="p-3 text-left">Dest</th>
					<th className="p-3 text-left">Flt Num</th>
					<th className="p-3 text-left">Departure</th>
					<th className="p-3 text-left">Arrival</th>
					{/* Headers for Days of the Week */}
					{fullWeekdays.map((day) => (
						<th
							key={day}
							className="p-3 text-center capitalize"
						>
							{weekdayMap[day]}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{schedule.map((flight, index) => (
					<tr
						key={index}
						className={`${
							index % 2 === 0 ? "bg-gray-100" : "bg-white"
						} hover:bg-emerald-100 transition duration-150`}
					>
						<td className="p-3">{flight.origin}</td>
						<td className="p-3">{flight.destination}</td>
						<td className="p-3">{"CX " + flight.flightNumber}</td>
						<td className="p-3">{flight.departureTime}</td>
						<td className="p-3">{flight.arrivalTime}</td>
						{/* Operating Days */}
						{fullWeekdays.map((day) => (
							<td
								key={day}
								className={`p-3 text-center ${
									flight.operatingDays[day]
										? "text-emerald-600"
										: "text-gray-400"
								}`}
							>
								{flight.operatingDays[day] ? "✔" : "—"}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
