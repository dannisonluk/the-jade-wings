import { NextRequest, NextResponse, userAgent } from "next/server";

const MOBILE_USER_AGENT_REGEX =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

function isMobileRequest(request: NextRequest): boolean {
	const deviceType = userAgent(request).device.type;
	if (deviceType === "mobile" || deviceType === "tablet") {
		return true;
	}

	const userAgentHeader = request.headers.get("user-agent") ?? "";
	return MOBILE_USER_AGENT_REGEX.test(userAgentHeader);
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname === "/") {
		return NextResponse.next();
	}

	if (isMobileRequest(request)) {
		return NextResponse.next();
	}

	const targetUrl = request.nextUrl.clone();
	targetUrl.pathname = "/";
	targetUrl.search = "";
	return NextResponse.redirect(targetUrl);
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
	],
};
