import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Jade Wings",
	description:
		"Jade Wings is a fan-made Cathay information website with cargo schedules, route maps, historical route visualizations, fleet details and lounge guides.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
