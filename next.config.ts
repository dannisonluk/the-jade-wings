import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		qualities: [75, 100],
		remotePatterns: [
			"www.cathaypacific.com",
			"www.executivetraveller.com",
			"www.verylvke.com",
			"www.swirepacific.com",
			"www.flyformiles.hk",
			"cdn.jakartapotato.com",
			"cdn.businesstraveller.com",
			"blogger.googleusercontent.com",
			"images.squarespace-cdn.com",
			"i.pointhacks.com",
			"efficientasianman.boardingarea.com",
			"cdn.onemileatatime.com",
			"www.travelweek.ca",
		].map((hostname) => ({ protocol: "https" as const, hostname })),
	},
};

export default nextConfig;
