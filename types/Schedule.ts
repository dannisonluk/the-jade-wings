// types/Schedule.ts

export interface OperatingDays {
	sunday: boolean;
	monday: boolean;
	tuesday: boolean;
	wednesday: boolean;
	thursday: boolean;
	friday: boolean;
	saturday: boolean;
}

export interface FlightSchedule {
	origin: string;
	destination: string;
	pair: string;
	region: string;
	country: string;
	city: string;
	carrier: string;
	flightNumber: string;
	serviceType: string;
	direction: string;
	departureTime: string;
	arrivalTime: string;
	operatingDays: OperatingDays;
	pattern?: string; // Add this for special patterns like "1|2"
}
