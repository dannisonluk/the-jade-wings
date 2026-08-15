// components/MobileHome.tsx
import HeroSection from "./HeroSection";
import Features from "./Features";

export default function HomePage() {
	return (
		<div className="bg-light min-h-screen">
			<HeroSection />
			<Features />
		</div>
	);
}
