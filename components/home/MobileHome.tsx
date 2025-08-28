// components/MobileHome.tsx
import HeroSection from "@/components/home/HeroSection";
import Features from "@/components/home/Features";

export default function MobileHome() {
	return (
		<div className="bg-light min-h-screen">
			<HeroSection />
			<Features />
		</div>
	);
}
