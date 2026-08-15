import type { ReactNode } from "react";

import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";

import Footer from "./Footer";
import NavBar from "./Navbar";

export default function SiteShell({
	children,
	locale,
}: {
	children: ReactNode;
	locale: Locale;
}) {
	const messages = getMessages(locale);

	return (
		<div className="flex min-h-screen flex-col">
			<NavBar locale={locale} messages={messages.navigation} />
			<main className="flex-1">{children}</main>
			<Footer message={messages.footer} />
		</div>
	);
}
