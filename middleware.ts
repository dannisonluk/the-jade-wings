import { NextRequest, NextResponse } from "next/server";

import { defaultLocale } from "@/i18n/config";

export function middleware(request: NextRequest) {
	const targetUrl = request.nextUrl.clone();
	targetUrl.pathname = `/${defaultLocale}`;
	return NextResponse.redirect(targetUrl);
}

export const config = {
	matcher: ["/"],
};
