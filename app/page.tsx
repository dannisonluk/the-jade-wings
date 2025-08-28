import { headers } from "next/headers";
import MobileHome from "@/components/home/MobileHome";
import PcHome from "@/components/home/PcHome";
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function Home() {
	const userAgent = (await headers()).get("user-agent") || "";
	const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

	if (isMobile) {
		// Mobile homepage uses NavBar/Footer, even though we’re in the no-chrome group
		return (
			<>
				<NavBar />
				<main className="min-h-screen">
					<MobileHome />
				</main>
				<Footer />
			</>
		);
	}

	// Desktop homepage: PcHome with no NavBar/Footer
	return (
		<main className="min-h-screen">
			<PcHome />
		</main>
	);
}
