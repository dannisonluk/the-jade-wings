export const OPERATING_DAYS = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
] as const;

export type OperatingDay = (typeof OPERATING_DAYS)[number];
export type OperatingDays = Record<OperatingDay, boolean>;

export interface FlightSchedule {
	carrier: string;
	flightNumber: string;
	origin: string;
	destination: string;
	pair: string;
	originRegion: string;
	destinationRegion: string | null;
	fullItinerary: string;
	stops: number;
	validFrom: string;
	validTo: string;
	operatingDays: OperatingDays;
	departureTime: string;
	departureDayOffset: number;
	arrivalTime: string;
	arrivalDayOffset: number;
	bodyType: string;
	aircraftType: string;
}

export type ScheduleIssueSeverity = "warning" | "error";

export interface ScheduleValidationIssue {
	severity: ScheduleIssueSeverity;
	source: string;
	row?: number;
	field?: keyof FlightSchedule | "schedule" | "workbook";
	message: string;
}

export interface ScheduleSourceSummary {
	file: string;
	sheet: string;
	recordCount: number;
	acceptedCount: number;
	lastModified: string;
}

export interface ScheduleProvenance {
	provider: string;
	status: "provided-source" | "unverified";
	retrievedAt: string | null;
	effectiveFrom: string | null;
	effectiveTo: string | null;
}

export interface ScheduleDataset {
	schedule: FlightSchedule[];
	meta: {
		title: string;
		schedulePeriod: string;
		disclaimer: string;
		lastModified: string;
		recordCount: number;
		regions: string[];
		sources: ScheduleSourceSummary[];
		provenance: ScheduleProvenance;
		issues: ScheduleValidationIssue[];
	};
}
