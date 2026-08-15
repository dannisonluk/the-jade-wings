// types/Fleet.ts

export interface FleetData {
	registration: string;
	aircraftType: string;
	configuration: string;
	deliveredDate: string;
	age: number;
}

export interface FleetSummary {
	aircraftType: string;
	cpaAircraftType: string;
	count: number;
	averageAge: number;
}
