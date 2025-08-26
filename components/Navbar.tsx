// components/Navbar.tsx
export default function Navbar() {
	return (
		<nav className="flex justify-between items-center px-6 py-4 bg-white text-[#004b47] shadow">
			{/* Logo */}
			<div className="text-lg font-bold text-primary">
				Cathay Fan Page
			</div>

			{/* Links */}
			<div className="hidden md:flex space-x-6">
				<a
					href="#forum"
					className="text-gray-700 hover:text-primary"
				>
					Forum
				</a>
				<a
					href="#fleet"
					className="text-gray-700 hover:text-primary"
				>
					Fleet Info
				</a>
				<a
					href="#dashboard"
					className="text-gray-700 hover:text-primary"
				>
					Dashboard
				</a>
			</div>

			{/* Sign In Button */}
			<button className="bg-primary text-white px-4 py-2 rounded hover:bg-green-800">
				Sign In
			</button>
		</nav>
	);
}
