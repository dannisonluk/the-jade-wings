import Footer from "@/components/Footer";
import NavBar from "@/components/Navbar";

export default function MobileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<NavBar />
			<main className="min-h-screen">{children}</main>
			<Footer />
		</>
	);
}
