import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	disable: false,
	register: false, // We'll register manually
	workboxOptions: {
		skipWaiting: true,
	},
	buildExcludes: [/dynamic-css-manifest\.json$/],
});

const nextConfig: NextConfig = {
	output: "standalone",
};

export default withPWA(nextConfig);
