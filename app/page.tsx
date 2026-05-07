import { headers } from "next/headers";
import MobileHome from "@/components/home/MobileHome";
import PcHome from "@/components/home/PcHome";
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function Home() {
	// Middleware guarantees non-mobile users can only access this route.
	// Root still adapts the UI between mobile and PC shells.
	const userAgent = (await headers()).get("user-agent") || "";
	const isMobile =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
			userAgent,
		);

	if (isMobile) {
		return (
			<div className="min-h-screen flex flex-col">
				<NavBar />
				<main className="flex-1 z-1000000000">
					<MobileHome />
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1 z-1000000000">
				<PcHome />
			</main>
		</div>
	);
}
