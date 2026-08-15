export type CabinKey = "first" | "business" | "premium-economy";

export type Cabin = {
	key: CabinKey;
	name: string;
	gradient: string;
	highlights: string[];
	seatPitch?: string;
	seatWidth?: string;
	bedLength?: string;
	dining?: string;
	amenities: string[];
};

export const CABINS: Cabin[] = [
	{
		key: "first",
		name: "First",
		gradient: "from-[#00695B] to-[#004D43]",
		highlights: [
			"Private suites",
			"A la carte dining",
			"Exclusive lounges",
		],
		seatPitch: "81–82 in",
		seatWidth: "36 in",
		bedLength: "81 in",
		dining: "Restaurant‑style, caviar on select routes",
		amenities: [
			"Priority services",
			"Champagne & vintage wines",
			"Amenity kits & PJs",
		],
	},
	{
		key: "business",
		name: "Business",
		gradient: "from-[#108772] to-[#00695B]",
		highlights: ["Full‑flat bed", "Direct aisle access", "Premium lounges"],
		seatPitch: "45–47 in (seat) / full‑flat bed",
		seatWidth: "21 in",
		bedLength: "78 in",
		dining: "Seasonal menu, dine‑on‑demand on select routes",
		amenities: [
			"Priority check‑in",
			"Large table & storage",
			"Noise‑reducing headphones",
		],
	},
	{
		key: "premium-economy",
		name: "Premium Economy",
		gradient: "from-[#E6F3F0] to-white",
		highlights: ["Wider seat", "Extra legroom", "Priority boarding"],
		seatPitch: "38 in",
		seatWidth: "19.5–20 in",
		dining: "Upgraded meal choices",
		amenities: [
			"Welcome drink",
			"Dedicated cabin",
			"Larger baggage allowance",
		],
	},
];
