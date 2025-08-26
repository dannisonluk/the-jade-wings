// app/page.tsx
import { headers } from "next/headers";
import MobileHome from "@/components/home/MobileHome";
import PcHome from "@/components/home/PcHome";

export default async function Home() {
	// Detect the user's device from the headers
	const userAgent = (await headers()).get("user-agent") || "";

	// Check if the user is on a mobile device
	const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

	// Render the appropriate view
	return (
		<div className="flex items-center justify-center min-h-screen">
			{isMobile ? <MobileHome /> : <PcHome />}
		</div>
	);
}
