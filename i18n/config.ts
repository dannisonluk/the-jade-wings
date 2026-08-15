export const locales = ["en", "zh-HK"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
	return locales.includes(value as Locale);
}

export function localizePath(pathname: string, locale: Locale): string {
	const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
	const segments = normalizedPath.split("/");

	if (segments[1] && isLocale(segments[1])) {
		segments[1] = locale;
		return segments.join("/") || `/${locale}`;
	}

	return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}
