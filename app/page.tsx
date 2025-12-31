"use client";

import { useState, useEffect } from "react";

export default function Home() {
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null
	);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [envConfigured, setEnvConfigured] = useState(true);

	useEffect(() => {
		// Check if environment is configured
		fetch("/api/push/vapid-public-key")
			.then((res) => res.json())
			.then((data) => {
				if (!data.publicKey || data.error) {
					setEnvConfigured(false);
					setMessage(
						"⚠️ Environment not configured. Please create .env.local file (see START_HERE.md)"
					);
				}
			})
			.catch(() => {
				setEnvConfigured(false);
			});

		if (
			typeof window !== "undefined" &&
			"serviceWorker" in navigator &&
			"PushManager" in window
		) {
			// Check current subscription status
			navigator.serviceWorker.ready.then((registration) => {
				registration.pushManager.getSubscription().then((sub) => {
					if (sub) {
						setSubscription(sub);
						setIsSubscribed(true);
					}
				});
			});
		}
	}, []);

	const urlBase64ToUint8Array = (base64String: string) => {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, "+")
			.replace(/_/g, "/");
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	};

	const subscribeUser = async () => {
		console.log("🔔 Starting subscription process...");
		setLoading(true);
		setMessage("");

		try {
			// Check for service worker support
			if (!("serviceWorker" in navigator)) {
				console.error("❌ Service workers not supported");
				setMessage("Service workers are not supported in this browser");
				setLoading(false);
				return;
			}

			// Check for push notification support
			if (!("PushManager" in window)) {
				console.error("❌ Push notifications not supported");
				setMessage("Push notifications are not supported in this browser");
				setLoading(false);
				return;
			}

			// Check if Notification API exists
			if (!("Notification" in window)) {
				console.error("❌ Notification API not available");
				setMessage("Notifications are not supported in this browser");
				setLoading(false);
				return;
			}

			console.log("📋 Current permission:", Notification.permission);

			// Request notification permission
			console.log("🔐 Requesting notification permission...");
			const permission = await Notification.requestPermission();
			console.log("📋 Permission result:", permission);
			console.log("📋 Permission result:", permission);

			if (permission !== "granted") {
				console.warn("⚠️ Notification permission denied");
				setMessage(
					"Notification permission denied. Please allow notifications in your browser settings."
				);
				setLoading(false);
				return;
			}

			// Wait for service worker to be ready
			console.log("⏳ Waiting for service worker...");
			const registration = await navigator.serviceWorker.ready;
			console.log("✅ Service worker ready:", registration.scope);

			// Get VAPID public key from server
			console.log("🔑 Fetching VAPID key...");
			const response = await fetch("/api/push/vapid-public-key");
			console.log("📡 VAPID key response:", response.status);
			console.log("📡 VAPID key response:", response.status);

			if (!response.ok) {
				console.error("❌ Failed to get VAPID key, status:", response.status);
				throw new Error(
					"Failed to get VAPID key. Make sure .env.local file is created with your VAPID keys."
				);
			}

			const data = await response.json();
			console.log("🔑 VAPID key received:", data.publicKey ? "✅" : "❌");

			if (!data.publicKey) {
				console.error("❌ VAPID public key missing in response");
				throw new Error(
					"VAPID public key is missing. Please check your .env.local file."
				);
			}

			// Subscribe to push notifications
			console.log("📱 Subscribing to push...");
			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(data.publicKey),
			});
			console.log("✅ Push subscription created:", sub.endpoint);

			// Send subscription to server
			console.log("💾 Saving subscription to server...");
			const saveResponse = await fetch("/api/push/subscribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(sub),
			});
			console.log("📡 Save response:", saveResponse.status);

			if (saveResponse.ok) {
				console.log("✅ Subscription saved successfully!");
				setSubscription(sub);
				setIsSubscribed(true);
				setMessage("Successfully subscribed to notifications!");
			} else {
				const errorData = await saveResponse.json().catch(() => ({}));
				console.error("❌ Failed to save subscription:", errorData);
				setMessage(errorData.error || "Failed to save subscription");
			}
		} catch (error: any) {
			console.error("❌ Error in subscription process:", error);
			let errorMessage = "Error subscribing to notifications";

			if (error.message) {
				errorMessage = error.message;
			} else if (error.name === "NotAllowedError") {
				errorMessage = "Notification permission denied";
			} else if (error.name === "NotSupportedError") {
				errorMessage = "Push notifications not supported";
			} else if (error.name === "AbortError") {
				errorMessage = "Subscription was cancelled";
			}

			setMessage(errorMessage);
		} finally {
			console.log("🏁 Subscription process complete, resetting loading state");
			setLoading(false);
		}
	};

	const unsubscribeUser = async () => {
		setLoading(true);
		setMessage("");

		try {
			if (subscription) {
				// Unsubscribe from push notifications
				await subscription.unsubscribe();

				// Remove subscription from server
				await fetch("/api/push/unsubscribe", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(subscription),
				});

				setSubscription(null);
				setIsSubscribed(false);
				setMessage("Successfully unsubscribed from notifications");
			}
		} catch (error) {
			console.error("Error unsubscribing:", error);
			setMessage("Error unsubscribing from notifications");
		} finally {
			setLoading(false);
		}
	};

	const sendTestNotification = async () => {
		setLoading(true);
		setMessage("");

		try {
			const response = await fetch("/api/push/send-test", {
				method: "POST",
			});

			if (response.ok) {
				setMessage("Test notification sent!");
			} else {
				setMessage("Failed to send test notification");
			}
		} catch (error) {
			console.error("Error sending test notification:", error);
			setMessage("Error sending test notification");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
				<div className="text-center mb-8">
					<div className="text-6xl mb-4">🔔</div>
					<h1 className="text-3xl font-bold text-gray-800 mb-2">
						Push Notifications
					</h1>
					<p className="text-gray-600">Get daily notifications at 10:00 AM</p>
				</div>

				<div className="space-y-4">
					{!envConfigured && (
						<div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
							<div className="flex items-start">
								<span className="text-2xl mr-3">⚠️</span>
								<div className="flex-1">
									<h3 className="font-bold text-yellow-800 mb-1">
										Setup Required
									</h3>
									<p className="text-sm text-yellow-700 mb-2">
										Create a{" "}
										<code className="bg-yellow-100 px-1 rounded">
											.env.local
										</code>{" "}
										file with your VAPID keys.
									</p>
									<p className="text-xs text-yellow-600">
										See <strong>START_HERE.md</strong> for instructions.
									</p>
								</div>
							</div>
						</div>
					)}

					{!isSubscribed ? (
						<button
							onClick={subscribeUser}
							disabled={loading || !envConfigured}
							className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105">
							{loading
								? "Loading..."
								: !envConfigured
								? "Setup Required"
								: "Enable Notifications"}
						</button>
					) : (
						<>
							<div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
								<span className="text-green-600 font-semibold">
									✓ Notifications Enabled
								</span>
							</div>

							<button
								onClick={sendTestNotification}
								disabled={loading}
								className="w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
								{loading ? "Sending..." : "Send Test Notification"}
							</button>

							<button
								onClick={unsubscribeUser}
								disabled={loading}
								className="w-full bg-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
								{loading ? "Loading..." : "Disable Notifications"}
							</button>
						</>
					)}

					{message && !message.includes("⚠️") && (
						<div
							className={`p-4 rounded-xl text-center font-medium ${
								message.includes("Error") ||
								message.includes("Failed") ||
								message.includes("denied")
									? "bg-red-50 text-red-600 border-2 border-red-200"
									: "bg-blue-50 text-blue-600 border-2 border-blue-200"
							}`}>
							{message}
						</div>
					)}
				</div>

				<div className="mt-8 pt-6 border-t border-gray-200">
					<h2 className="font-semibold text-gray-800 mb-2">Features:</h2>
					<ul className="space-y-2 text-sm text-gray-600">
						<li className="flex items-start">
							<span className="mr-2">✨</span>
							<span>Daily notifications at 10:00 AM</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">📱</span>
							<span>Works offline as a PWA</span>
						</li>
						<li className="flex items-start">
							<span className="mr-2">🔒</span>
							<span>Secure push notification delivery</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
