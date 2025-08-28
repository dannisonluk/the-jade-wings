import { headers } from "next/headers";
import MobileHome from "@/components/home/MobileHome";
import PcHome from "@/components/home/PcHome";
import NavBar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function Home() {
	const userAgent = (await headers()).get("user-agent") || "";
	const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

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
