interface FiltersProps {
	filters: {
		origin: string;
		destination: string;
		flightNumber: string;
		region: string;
	};
	setFilters: React.Dispatch<
		React.SetStateAction<{
			origin: string;
			destination: string;
			flightNumber: string;
			region: string;
		}>
	>;
}

export default function Filters({ filters, setFilters }: FiltersProps) {
	return (
		<div className="flex flex-wrap gap-4 justify-center sm:justify-start">
			{/* Origin Filter */}
			<input
				type="text"
				placeholder="Origin"
				value={filters.origin}
				onChange={(e) =>
					setFilters((prev) => ({ ...prev, origin: e.target.value }))
				}
				className="p-2 border rounded-lg shadow-sm w-full sm:w-60 focus:outline-none focus:ring focus:ring-emerald-400"
			/>

			{/* Destination Filter */}
			<input
				type="text"
				placeholder="Destination"
				value={filters.destination}
				onChange={(e) =>
					setFilters((prev) => ({
						...prev,
						destination: e.target.value,
					}))
				}
				className="p-2 border rounded-lg shadow-sm w-full sm:w-60 focus:outline-none focus:ring focus:ring-emerald-400"
			/>

			{/* Flight Number Filter */}
			<input
				type="text"
				placeholder="Flight Number"
				value={filters.flightNumber}
				onChange={(e) =>
					setFilters((prev) => ({
						...prev,
						flightNumber: e.target.value,
					}))
				}
				className="p-2 border rounded-lg shadow-sm w-full sm:w-60 focus:outline-none focus:ring focus:ring-emerald-400"
			/>

			{/* Region Filter */}
			<select
				value={filters.region}
				onChange={(e) =>
					setFilters((prev) => ({ ...prev, region: e.target.value }))
				}
				className="p-2 border rounded-lg shadow-sm w-full sm:w-60 focus:outline-none focus:ring focus:ring-emerald-400"
			>
				<option value="">All Regions</option>
				<option value="EUR">EUR</option>
				<option value="SWP">SWP</option>
				<option value="SAMEA">SAMEA</option>
				{/* Add more regions here */}
			</select>
		</div>
	);
}
