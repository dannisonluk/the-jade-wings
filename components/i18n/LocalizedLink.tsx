"use client";

import Link, { type LinkProps } from "next/link";
import { useParams } from "next/navigation";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

import { defaultLocale, isLocale, localizePath } from "@/i18n/config";

type LocalizedLinkProps = PropsWithChildren<
	LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>
>;

export default function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
	const params = useParams<{ locale?: string }>();
	const locale = params.locale && isLocale(params.locale) ? params.locale : defaultLocale;
	const localizedHref =
		typeof href === "string" && href.startsWith("/") && !href.startsWith("/api/")
			? localizePath(href, locale)
			: href;

	return <Link href={localizedHref} {...props} />;
}
