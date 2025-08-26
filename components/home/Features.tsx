// components/home/Features.tsx
export default function Features() {
	return (
		<div
			id="features"
			className="py-8 bg-white"
		>
			<div className="max-w-7xl mx-auto px-8 lg:px-12">
				<div className="text-center mb-4">
					<h2 className="text-3xl font-bold mb-4 text-[#004b47]">
						Explore Cathay Pacific
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto">
						A comprehensive platform for tracking, discovering, and
						sharing your Cathay Pacific experience
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-4">
					{/* Flight Lookup Feature */}
					<div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">✈️</span>
						</div>
						<h3 className="text-xl font-bold mb-2">
							Flight Lookup
						</h3>
						<p className="text-gray-600 mb-4">
							Check your next flight&apos;s aircraft type, seat
							configuration, and amenities
						</p>
						<a
							href="#flight-lookup"
							className="text-green-600 hover:underline font-medium"
						>
							Search Flights
						</a>
					</div>

					{/* Fleet Explorer Feature */}
					<div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">🛩️</span>
						</div>
						<h3 className="text-xl font-bold mb-2">
							Fleet Explorer
						</h3>
						<p className="text-gray-600 mb-4">
							Discover Cathay Pacific&apos;s entire fleet with
							detailed specs and seat maps
						</p>
						<a
							href="#fleet"
							className="text-green-600 hover:underline font-medium"
						>
							View Fleet
						</a>
					</div>

					{/* Route Map Feature */}
					<div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">🌏</span>
						</div>
						<h3 className="text-xl font-bold mb-2">
							Route Network
						</h3>
						<p className="text-gray-600 mb-4">
							Explore Cathay Pacific&apos;s global coverage and
							discover new destinations
						</p>
						<a
							href="#routes"
							className="text-green-600 hover:underline font-medium"
						>
							Explore Routes
						</a>
					</div>

					{/* Lounge Guide Feature */}
					<div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">🥂</span>
						</div>
						<h3 className="text-xl font-bold mb-2">Lounge Guide</h3>
						<p className="text-gray-600 mb-4">
							Complete guide to Cathay Pacific lounges worldwide
							with amenities and access
						</p>
						<a
							href="#lounges"
							className="text-green-600 hover:underline font-medium"
						>
							View Lounges
						</a>
					</div>

					{/* Flight Tracker Feature */}
					<div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">📡</span>
						</div>
						<h3 className="text-xl font-bold mb-2">
							Live Flight Tracker
						</h3>
						<p className="text-gray-600 mb-4">
							Track any Cathay Pacific flight in real-time with
							live updates
						</p>
						<a
							href="#tracker"
							className="text-green-600 hover:underline font-medium"
						>
							Track Flights
						</a>
					</div>

					{/* Community Forum Feature */}
					<div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">💬</span>
						</div>
						<h3 className="text-xl font-bold mb-2">
							Community Forum
						</h3>
						<p className="text-gray-600 mb-4">
							Share experiences, tips, and connect with fellow
							Cathay Pacific enthusiasts
						</p>
						<a
							href="#forum"
							className="text-green-600 hover:underline font-medium"
						>
							Join Community
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
