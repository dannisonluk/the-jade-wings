import Image from "next/image";
import background from "/public/images/home/mobile/777_takeoff.jpg";

// components/home/HeroSection.tsx
export default function HeroSection() {
	return (
		<div className="relative bg-light py-20 px-6 text-center">
			{/* Background Image */}
			<Image
				alt="777 Takeoff"
				src={background}
				placeholder="blur"
				quality={100}
				fill
				sizes="100vw"
				style={{
					objectFit: "cover",
				}}
			/>
			<div className="relative z-10 text-white flex flex-col justify-end h-full">
				{/* Headline */}
				<h3 className="text-2xl md:text-5xl font-bold mb-4">
					Your Cathay Companion: Information at Your Fingertips
				</h3>
			</div>
			{/* Overlay */}
			<div className="absolute inset-0 bg-black opacity-30"></div>
		</div>
	);
}
