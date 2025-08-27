// app/api/flight/[flightNumber]/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { promises as fs } from "fs";
import path from "path";
import { FlightData } from "@/types/Flight";

interface ExcelRow {
	date: string | number | Date;
	from: string;
	to: string;
	aircraft: string;
	flightTime: string | number;
	std: string | number;
	atd: string | number;
	sta: string | number;
	ata: string | number;
	status: string;
}

type ExcelCellValue = string | number | Date | boolean | null | undefined;
type ExcelRowArray = ExcelCellValue[];

// Helper function to convert Excel time to HH:MM format
function excelTimeToHHMM(excelTime: ExcelCellValue): string {
	if (
		!excelTime ||
		excelTime === "--" ||
		excelTime === "-" ||
		excelTime === ""
	)
		return "--";

	// If it's already a string in correct format
	if (typeof excelTime === "string") {
		// Check for AM/PM format
		const ampmMatch = excelTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
		if (ampmMatch) {
			let hours = parseInt(ampmMatch[1]);
			const minutes = ampmMatch[2];
			const period = ampmMatch[3].toUpperCase();

			if (period === "PM" && hours !== 12) {
				hours += 12;
			} else if (period === "AM" && hours === 12) {
				hours = 0;
			}

			return `${hours.toString().padStart(2, "0")}:${minutes}`;
		}

		// Check if already in HH:MM format
		if (excelTime.match(/^\d{1,2}:\d{2}/)) {
			const [h, m] = excelTime.split(":");
			return `${h.padStart(2, "0")}:${m}`;
		}

		// Check if it's a date string with time
		if (excelTime.includes("1900")) {
			// Extract just the time part from strings like "1900-01-00 10:25:00"
			const timeMatch = excelTime.match(/(\d{1,2}):(\d{2})/);
			if (timeMatch) {
				return `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
			}
		}

		return excelTime;
	}

	// If it's a number (Excel decimal time)
	if (typeof excelTime === "number") {
		// Excel stores time as fraction of a day
		let totalMinutes = Math.round(excelTime * 24 * 60);

		// Handle cases where Excel might have added days
		if (excelTime > 1) {
			// Remove the day part and just keep the time fraction
			const timeFraction = excelTime % 1;
			totalMinutes = Math.round(timeFraction * 24 * 60);
		}

		const hours = Math.floor(totalMinutes / 60) % 24; // Ensure hours don't exceed 24
		const minutes = totalMinutes % 60;

		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}`;
	}

	// Handle Date objects
	if (excelTime instanceof Date) {
		const hours = excelTime.getHours();
		const minutes = excelTime.getMinutes();
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}`;
	}

	return "--";
}

// Helper function to format date
function formatExcelDate(dateValue: ExcelCellValue): string {
	if (!dateValue) return "N/A";

	// If it's a number (Excel serial date)
	if (typeof dateValue === "number") {
		const excelEpoch = new Date(1899, 11, 30);
		const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	// If it's a Date object
	if (dateValue instanceof Date) {
		return dateValue.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	// If it's a string
	if (typeof dateValue === "string") {
		// Try to parse as date
		const date = new Date(dateValue);
		if (!isNaN(date.getTime())) {
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		}
		return dateValue;
	}

	return "N/A";
}

// Helper function to safely convert to string
function safeToString(value: ExcelCellValue): string {
	if (value === null || value === undefined) return "--";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	return String(value);
}

// Option B: params may be a Promise, so allow both and await when used
type ParamsOrPromise =
	| { flightNumber: string }
	| Promise<{ flightNumber: string }>;

export async function GET(
	request: NextRequest,
	context: { params: Promise<ParamsOrPromise> }
): Promise<NextResponse> {
	try {
		const { flightNumber: flightNumberRaw } = await context.params;
		const flightNumber = flightNumberRaw.toUpperCase();

		// Define the airports to search (excluding HKG)
		const airports: string[] = ["KIX", "NGO", "FUK", "NRT", "HND", "CTS"]; // Add all your non-HKG ports

		const flightData: FlightData[] = [];

		// Search through each airport's Excel file
		for (const airport of airports) {
			const filePath = path.join(
				process.cwd(),
				"db",
				"xlsx",
				"flown",
				"NEA",
				`${airport}.xlsx`
			);

			try {
				const fileBuffer = await fs.readFile(filePath);
				const workbook = XLSX.read(fileBuffer, {
					type: "buffer",
					cellDates: false, // Don't auto-convert to dates
					cellNF: false,
					cellText: true, // Keep text as-is
					raw: false,
				});

				// Check if the flight number exists as a sheet name
				if (workbook.SheetNames.includes(flightNumber)) {
					const worksheet = workbook.Sheets[flightNumber];

					// Convert to JSON with raw values
					const jsonData = XLSX.utils.sheet_to_json<ExcelRowArray>(
						worksheet,
						{
							header: 1,
							defval: "--",
							raw: false,
							dateNF: "yyyy-mm-dd",
						}
					);

					// Skip header row and process data
					for (let i = 1; i < jsonData.length; i++) {
						const row: ExcelRowArray = jsonData[i];
						if (row && row.length > 0 && row[0]) {
							// Check if row has data
							const processedFlight: FlightData = {
								date: formatExcelDate(row[0]),
								from: safeToString(row[1]),
								to: safeToString(row[2]),
								aircraft: safeToString(row[3]),
								flightTime: excelTimeToHHMM(row[4]),
								std: excelTimeToHHMM(row[5]),
								atd: excelTimeToHHMM(row[6]),
								sta: excelTimeToHHMM(row[7]),
								ata: excelTimeToHHMM(row[8]),
								status: safeToString(row[9]) || "Scheduled",
							};

							flightData.push(processedFlight);
						}
					}
				}
			} catch (error) {
				console.error(`Error reading ${airport}.xlsx:`, error);
				// Continue to next airport file
			}
		}

		if (flightData.length === 0) {
			return NextResponse.json(
				{ error: "Flight not found" },
				{ status: 404 }
			);
		}

		// Sort by date (most recent first)
		flightData.sort((a: FlightData, b: FlightData) => {
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);
			return dateB.getTime() - dateA.getTime();
		});

		return NextResponse.json({
			flightNumber,
			flights: flightData,
		});
	} catch (error) {
		console.error("Error fetching flight data:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
