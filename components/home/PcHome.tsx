import Image from "next/image";
import Link from "next/link"; // Import Next.js Link

// components/PcHome.tsx
export default function PcHome() {
	return (
		<div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center">
			{/* Hero Image */}
			<div className="relative w-full max-w-4xl mt-8">
				<Image
					src="/images/background/a350_over_the_sky.jpg" // Replace with your image path
					alt="Airplane in the sky"
					width={960}
					height={400}
					className="w-full rounded-lg shadow-lg"
				/>
			</div>

			{/* QR Code Section */}
			<section className="w-full max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between py-8 px-4">
				<div className="text-center md:text-left md:flex-1">
					<h2 className="text-3xl font-bold text-gray-800 mb-2">
						Please Switch to Mobile!
					</h2>
					<p className="text-base text-gray-600">
						Thank you for visiting the Cathay Tracker fan page.
					</p>
					<p className="text-base text-gray-600">
						For the best experience, visit{" "}
						<Link href="https://cathay-tracker.vercel.app/">
							<span className="font-bold underline">this site</span>
						</Link>{" "}
						using a mobile browser or scan the QR code on the right.
					</p>
				</div>
				<div className="mt-6 md:mt-0 md:ml-8">
					<div className="bg-white p-4 rounded-lg shadow-md">
						<Image
							src="/images/qr_code/website.png" // Replace with your QR code path
							alt="QR Code for Mobile App"
							width={160}
							height={160}
							className="mx-auto"
						/>
					</div>
					<p className="mt-2 text-sm text-gray-600 text-center">
						Scan the QR code to open on your mobile device.
					</p>
				</div>
			</section>
		</div>
	);
}
