import Head from "next/head";
import { useState, useEffect } from "react";

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Check if push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check if already subscribed
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setIsLoading(true);
    
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== "granted") {
        alert("Notification permission denied");
        return;
      }

      // Get VAPID public key
      const response = await fetch("/api/push/vapid-public-key");
      const { publicKey } = await response.json();

      // Subscribe to push notifications
      const registration = await navigator.serviceWorker.ready;
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Save subscription to server
      const saveResponse = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSubscription.toJSON()),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save subscription");
      }

      setSubscription(newSubscription);
      setIsSubscribed(true);
      alert("Successfully subscribed to push notifications! 🎉");
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      alert("Failed to subscribe to push notifications: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    
    try {
      if (!subscription) {
        throw new Error("No subscription found");
      }

      // Unsubscribe from push notifications
      await subscription.unsubscribe();

      // Remove subscription from server
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      setSubscription(null);
      setIsSubscribed(false);
      alert("Successfully unsubscribed from push notifications");
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      alert("Failed to unsubscribe: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Notification 🎉",
          body: "This is a test push notification from your PWA!",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Notification sent to ${result.stats.successful} device(s)!`);
      } else {
        alert("Failed to send notification: " + result.error);
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      alert("Failed to send test notification: " + (error as Error).message);
    }
  };

  return (
    <>
      <Head>
        <title>My PWA App - Push Notifications</title>
        <meta
          name="description"
          content="A Progressive Web App with Push Notifications"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-gray-800">
          <div className="text-6xl mb-4 text-center">🔔</div>
          <h1 className="text-3xl font-bold mb-2 text-center">My PWA App</h1>
          <p className="text-gray-600 mb-6 text-center">
            With Push Notifications
          </p>

          {!isSupported && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Not Supported</p>
              <p className="text-sm">
                Push notifications are not supported in this browser.
              </p>
            </div>
          )}

          {isSupported && (
            <div className="space-y-4">
              {/* Status */}
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Status:
                </p>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isSubscribed ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm">
                    {isSubscribed ? "Subscribed" : "Not Subscribed"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Permission: {permission}
                </p>
              </div>

              {/* Subscribe/Unsubscribe Button */}
              {!isSubscribed ? (
                <button
                  onClick={subscribeToPush}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isLoading ? "Subscribing..." : "🔔 Enable Notifications"}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={sendTestNotification}
                    className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors"
                  >
                    📤 Send Test Notification
                  </button>
                  <button
                    onClick={unsubscribeFromPush}
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      isLoading
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {isLoading ? "Unsubscribing..." : "🔕 Disable Notifications"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-left">
            <h2 className="font-semibold text-gray-800 mb-2">Features:</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">✨</span>
                <span>Works offline</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📱</span>
                <span>Installable on any device</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚡</span>
                <span>Fast and reliable</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔔</span>
                <span>Push notifications support</span>
              </li>
            </ul>
          </div>

          {/* API Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-2">API Endpoints:</h2>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                <code className="bg-gray-100 px-2 py-1 rounded">
                  POST /api/push/send
                </code>
              </p>
              <p className="text-[11px] text-gray-500 ml-2">
                Send push notifications to all subscribers
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
