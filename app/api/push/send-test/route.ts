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

export async function POST() {
	try {
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
			return NextResponse.json(
				{ error: "No subscriptions found" },
				{ status: 404 }
			);
		}

		const payload = JSON.stringify({
			title: "Test Notification",
			body: "This is a test notification from your PWA!",
		});

		const results = await Promise.allSettled(
			subscriptions.map((subscription) =>
				webpush.sendNotification(subscription, payload)
			)
		);

		const successCount = results.filter((r) => r.status === "fulfilled").length;
		const failureCount = results.filter((r) => r.status === "rejected").length;

		return NextResponse.json({
			success: true,
			message: `Sent notifications to ${successCount} subscribers. ${failureCount} failed.`,
			successCount,
			failureCount,
		});
	} catch (error) {
		console.error("Error sending test notification:", error);
		return NextResponse.json(
			{ error: "Failed to send notification" },
			{ status: 500 }
		);
	}
}
