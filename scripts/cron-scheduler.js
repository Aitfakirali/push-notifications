#!/usr/bin/env node

/**
 * Cron Scheduler Script
 * Sends push notifications daily at 10:00 AM to all subscribed users
 *
 * Usage:
 *   npm run cron
 *
 * For production, use:
 * - Vercel Cron Jobs (configured in vercel.json)
 * - A cloud scheduler (AWS EventBridge, Google Cloud Scheduler)
 * - A dedicated task queue service
 */

const cron = require("node-cron");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
	const envFile = fs.readFileSync(envPath, "utf-8");
	envFile.split("\n").forEach((line) => {
		const trimmedLine = line.trim();
		if (trimmedLine && !trimmedLine.startsWith("#")) {
			const equalIndex = trimmedLine.indexOf("=");
			if (equalIndex > 0) {
				const key = trimmedLine.substring(0, equalIndex).trim();
				let value = trimmedLine.substring(equalIndex + 1).trim();
				// Remove quotes if present
				if (
					(value.startsWith('"') && value.endsWith('"')) ||
					(value.startsWith("'") && value.endsWith("'"))
				) {
					value = value.slice(1, -1);
				}
				if (key && value) {
					process.env[key] = value;
				}
			}
		}
	});
	console.log("✅ Loaded environment variables from .env.local");
}

// Configuration
const APP_URL =
	process.env.APP_URL || process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET || "";

console.log("🚀 Cron Scheduler started");
console.log("📅 Scheduled to send notifications every 10 seconds");
console.log("🌐 App URL:", APP_URL);
console.log(
	"🔐 CRON_SECRET:",
	CRON_SECRET
		? `✅ Set (${CRON_SECRET.substring(0, 8)}...)`
		: "⚠️ Not set - requests will work only if API doesn't require auth"
);

// Send notifications every 10 seconds
// Using setInterval since node-cron doesn't support seconds precision
setInterval(() => {
	console.log(
		`\n⏰ [${new Date().toISOString()}] Running scheduled notification task...`
	);
	sendDailyNotifications();
}, 10000); // 10000 milliseconds = 10 seconds

// Also keep the daily schedule (optional - comment out if you only want 10-second intervals)
// cron.schedule('0 10 * * *', () => {
//   console.log(`\n⏰ [${new Date().toISOString()}] Daily notification at 10:00 AM...`);
//   sendDailyNotifications();
// }, {
//   timezone: "America/New_York"
// });

function sendDailyNotifications() {
	const url = new URL("/api/push/send", APP_URL);
	const protocol = url.protocol === "https:" ? https : http;

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: CRON_SECRET ? `Bearer ${CRON_SECRET}` : undefined,
		},
		body: JSON.stringify({
			title: "Test Notification",
			body: "This is a test notification",
			icon: "/icon-192x192.png",
			badge: "/icon-192x192.png",
			image: "/icon-192x192.png",
			data: {
				url: "/",
			},
			actions: [],
			tag: "test",
			requireInteraction: false,
		}),
	};

	// Remove undefined headers
	Object.keys(options.headers).forEach((key) => {
		if (options.headers[key] === undefined) {
			delete options.headers[key];
		}
	});

	const req = protocol.request(url, options, (res) => {
		let data = "";

		res.on("data", (chunk) => {
			data += chunk;
		});

		res.on("end", () => {
			console.log("✅ Response status:", res.statusCode);
			try {
				const response = JSON.parse(data);
				// console.log("📊 Result:", response);

				if (response.success) {
					console.log(
						`✅ Successfully sent to ${response.stats.successful} subscribers`
					);
					if (response.stats?.failed > 0) {
						console.log(`⚠️ ${response.stats?.failed} notifications failed`);
					}
				} else {
					console.error("❌ Error:", response.error || response.message);
				}
			} catch (e) {
				console.log("📄 Response:", data);
			}
		});
	});

	req.write(options.body);

	req.on("error", (error) => {
		console.error("❌ Error sending notifications:", error.message);
	});

	req.end();
}

// Keep the process running
process.on("SIGINT", () => {
	console.log("\n👋 Shutting down cron scheduler...");
	process.exit(0);
});

console.log("\n✨ Scheduler is running. Press Ctrl+C to stop.\n");
console.log("📅 Notifications will be sent every 10 seconds.\n");
