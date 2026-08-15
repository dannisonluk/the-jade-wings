import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale, locales } from "@/i18n/config";
import "../globals.css";

export const metadata: Metadata = {
	title: "Jade Wings",
	description:
		"A fan-made Cathay information website with cargo schedules, route maps, fleet details and lounge guides.",
};

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	const { locale: localeParam } = await params;
	if (!isLocale(localeParam)) notFound();

	return (
		<html lang={localeParam}>
			<body>{children}</body>
		</html>
	);
}
