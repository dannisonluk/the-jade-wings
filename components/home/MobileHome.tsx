// components/MobileHome.tsx
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import Features from "@/components/home/Features";
import Footer from "@/components/Footer";

export default function MobileHome() {
	return (
		<div className="bg-light min-h-screen">
			<Navbar />
			<HeroSection />
			<Features />
			<Footer />
		</div>
	);
}
