import Image from "next/image";

// components/PcHome.tsx
export default function PcHome() {
	return (
		<div className="bg-light min-h-screen max-w-7xl flex flex-col items-center justify-center text-center">
			<Image
				src="/images/background/a350_over_victoria_harbour.jpg"
				alt="QR Code for Mobile App"
				width={800}
				height={480}
			/>

			{/* Message for PC Users */}
			<h1 className="text-3xl md:text-5xl font-bold mb-4">
				Please Switch to Mobile!
			</h1>

			<p className="text-lg md:text-xl mb-6">
				For the best experience, visit this site using a mobile browser
				or download our mobile app.
			</p>

			{/* QR Code or App Link */}
			<div className="mt-4">
				<Image
					src="/images/home/pc/qr_code.png"
					alt="QR Code for Mobile App"
					className="w-40 h-40 mx-auto"
					width={160}
					height={160}
				/>
				<p className="mt-2 text-sm text-gray-600">
					Scan the QR code to open on your mobile device.
				</p>
			</div>
		</div>
	);
}
