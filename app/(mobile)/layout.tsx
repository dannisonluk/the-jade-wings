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
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
