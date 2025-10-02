import { CabinTemplate } from "@/components/cabins/CabinTemplates";

export default function BusinessCabinPage() {
	return (
		<CabinTemplate
			name="Business"
			gradient="from-[#108772] to-[#00695B]"
			intro="A refined space to work, dine, and rest—full‑flat seats with direct aisle access across our long‑haul fleet."
			highlights={[
				"Full‑flat bed",
				"Direct aisle access",
				"Premium lounges",
			]}
			specs={[
				{ label: "Seat width", value: "21 in" },
				{ label: "Bed length", value: "78 in" },
				{ label: "Layout", value: "1‑2‑1 (long‑haul)" },
				{ label: "Screen", value: "18–24 in (aircraft dependent)" },
			]}
			amenities={[
				"Dine anytime (select routes)",
				"Large table & storage",
				"Noise‑reducing headphones",
				"Power & USB‑C charging",
			]}
		/>
	);
}
