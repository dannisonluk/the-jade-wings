"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { localizePath, type Locale } from "@/i18n/config";

export function LanguageSwitcher({
	locale,
	label,
}: {
	locale: Locale;
	label: string;
}) {
	const pathname = usePathname();
	const router = useRouter();

	return (
		<Select
			value={locale}
			onValueChange={(nextLocale: Locale) => {
				router.push(localizePath(pathname, nextLocale));
			}}
		>
			<SelectTrigger
				aria-label={label}
				className="h-9 w-[118px] border border-slate-300 bg-white px-3 text-slate-800 shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-emerald-600"
			>
				<Languages className="h-4 w-4" aria-hidden="true" />
				<SelectValue />
			</SelectTrigger>
			<SelectContent className="z-[1000000003]">
				<SelectItem value="en">English</SelectItem>
				<SelectItem value="zh-HK">中文</SelectItem>
			</SelectContent>
		</Select>
	);
}
