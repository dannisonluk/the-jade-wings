import Footer from "@/components/Footer";
import NavBar from "@/components/Navbar";

export default function MobileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col">
			<NavBar />
			<main className="flex-1 z-1000000000">{children}</main>
			<Footer />
		</div>
	);
}
