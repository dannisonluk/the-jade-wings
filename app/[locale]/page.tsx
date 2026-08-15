import { headers } from "next/headers";

import SiteShell from "@/components/layout/SiteShell";
import { isLocale, type Locale } from "@/i18n/config";
import HomePage from "@/features/home/components/HomePage";
import PcHome from "@/features/home/components/PcHome";

const MOBILE_USER_AGENT_REGEX =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export default async function Page({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale: localeParam } = await params;
	if (!isLocale(localeParam)) return null;

	const userAgent = (await headers()).get("user-agent") ?? "";
	if (!MOBILE_USER_AGENT_REGEX.test(userAgent)) return <PcHome />;

	return (
		<SiteShell locale={localeParam as Locale}>
			<HomePage />
		</SiteShell>
	);
}
