import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Store subscriptions in a JSON file (for production, use a database)
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

export async function POST(request: NextRequest) {
	try {
		const subscription = await request.json();

		const subscriptions = getSubscriptions();

		// Check if subscription already exists
		const exists = subscriptions.some(
			(sub) => sub.endpoint === subscription.endpoint
		);

		if (!exists) {
			subscriptions.push({
				...subscription,
				subscribedAt: new Date().toISOString(),
			});
			saveSubscriptions(subscriptions);
		}

		return NextResponse.json({
			success: true,
			message: "Subscription saved successfully",
		});
	} catch (error) {
		console.error("Error saving subscription:", error);
		return NextResponse.json(
			{ error: "Failed to save subscription" },
			{ status: 500 }
		);
	}
}
