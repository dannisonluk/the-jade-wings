// types/Flight.ts
export interface FlightData {
	date: string;
	from: string;
	to: string;
	aircraft: string;
	flightTime: string;
	std: string; // Scheduled Time of Departure
	atd: string; // Actual Time of Departure
	sta: string; // Scheduled Time of Arrival
	ata: string; // Actual Time of Arrival (if available)
	status: string;
}

export interface FlightSearchResult {
	flightNumber: string;
	flights: FlightData[];
}

export type ExcelDateValue = string | number | Date | null | undefined;
export type ExcelTimeValue = string | number | Date | null | undefined;
export type ExcelCellValue =
	| string
	| number
	| Date
	| boolean
	| null
	| undefined;
