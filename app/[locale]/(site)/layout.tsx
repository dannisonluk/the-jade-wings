import { notFound } from "next/navigation";

import SiteShell from "@/components/layout/SiteShell";
import { isLocale, type Locale } from "@/i18n/config";

export default async function SiteLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	const { locale: localeParam } = await params;
	if (!isLocale(localeParam)) notFound();

	return <SiteShell locale={localeParam as Locale}>{children}</SiteShell>;
}
