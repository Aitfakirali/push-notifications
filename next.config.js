const withPWA = require("next-pwa")({
	dest: "public",
	register: true,
	skipWaiting: true,
	disable: false, // Disable PWA in dev to avoid caching issues
	reloadOnOnline: true,
	publicExcludes: ["!sw-push.js", "!push-handler.js"], // Don't precache these
	buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
