import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
	try {
		const subscription = await request.json();

		let subscriptions = getSubscriptions();

		// Remove the subscription
		subscriptions = subscriptions.filter(
			(sub) => sub.endpoint !== subscription.endpoint
		);

		saveSubscriptions(subscriptions);

		return NextResponse.json({
			success: true,
			message: "Unsubscribed successfully",
		});
	} catch (error) {
		console.error("Error unsubscribing:", error);
		return NextResponse.json(
			{ error: "Failed to unsubscribe" },
			{ status: 500 }
		);
	}
}
