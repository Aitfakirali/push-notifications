import { NextResponse } from "next/server";
import webpush from "web-push";
import fs from "fs";
import path from "path";

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), "subscriptions.json");

function getSubscriptions(): any[] {
	try {
		if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
			const data = fs.readFileSync(SUBSCRIPTIONS_FILE, "utf-8");
			return JSON.parse(data);
		}
	} catch (error) {
		console.error("Error reading subscriptions:", error);
	}
	return [];
}

function saveSubscriptions(subscriptions: any[]): void {
	try {
		fs.writeFileSync(
			SUBSCRIPTIONS_FILE,
			JSON.stringify(subscriptions, null, 2)
		);
	} catch (error) {
		console.error("Error saving subscriptions:", error);
	}
}

export async function POST(request: Request) {
	try {
		// Simple security check - verify the request is from authorized source
		const authHeader = request.headers.get("authorization");
		const cronSecret = process.env.CRON_SECRET;

		if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
		const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
		const vapidSubject = process.env.VAPID_SUBJECT || "mailto:test@example.com";

		if (!vapidPublicKey || !vapidPrivateKey) {
			return NextResponse.json(
				{ error: "VAPID keys not configured" },
				{ status: 500 }
			);
		}

		webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

		const subscriptions = getSubscriptions();

		if (subscriptions.length === 0) {
			return NextResponse.json({
				success: true,
				message: "No subscriptions to send to",
				successCount: 0,
				failureCount: 0,
			});
		}

		const now = new Date();
		const dateStr = now.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		const payload = JSON.stringify({
			title: "Good Morning! ☀️",
			body: `It's ${dateStr}. Have a great day!`,
		});

		const results = await Promise.allSettled(
			subscriptions.map((subscription) =>
				webpush.sendNotification(subscription, payload)
			)
		);

		// Remove invalid subscriptions (those that returned errors like 410 Gone)
		const validSubscriptions: any[] = [];
		results.forEach((result, index) => {
			if (result.status === "fulfilled") {
				validSubscriptions.push(subscriptions[index]);
			} else if (result.status === "rejected") {
				const error = result.reason as any;
				// Don't remove subscription on temporary errors
				if (error.statusCode !== 410 && error.statusCode !== 404) {
					validSubscriptions.push(subscriptions[index]);
				}
			}
		});

		// Save updated subscriptions (with invalid ones removed)
		if (validSubscriptions.length !== subscriptions.length) {
			saveSubscriptions(validSubscriptions);
		}

		const successCount = results.filter((r) => r.status === "fulfilled").length;
		const failureCount = results.filter((r) => r.status === "rejected").length;

		return NextResponse.json({
			success: true,
			message: `Daily notifications sent`,
			successCount,
			failureCount,
			totalSubscriptions: subscriptions.length,
		});
	} catch (error) {
		console.error("Error sending daily notification:", error);
		return NextResponse.json(
			{ error: "Failed to send daily notification" },
			{ status: 500 }
		);
	}
}
