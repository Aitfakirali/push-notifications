// Push notification event handler
self.addEventListener("push", function (event) {
	console.log("[Worker] ===== PUSH EVENT RECEIVED =====");
	console.log("[Worker] Timestamp:", new Date().toISOString());
	console.log("[Worker] Event type:", event.type);
	console.log("[Worker] Has data:", !!event.data);

	if (event.data) {
		console.log("[Worker] Data type:", typeof event.data);
		try {
			const text = event.data.text();
			console.log("[Worker] Data as text:", text);
		} catch (textError) {
			console.log("[Worker] Could not read as text:", textError);
		}
	}

	let notificationData = {
		title: "New Notification",
		body: "You have a new notification",
		icon: "/icon-192x192.png",
		badge: "/icon-192x192.png",
	};

	if (event.data) {
		try {
			const data = event.data.json();
			console.log("[Worker] Parsed data:", data);
			notificationData = {
				title: data.title || notificationData.title,
				body: data.body || notificationData.body,
				icon: data.icon || notificationData.icon,
				badge: data.badge || notificationData.badge,
				image: data.image,
				data: data.data || {},
				actions: data.actions || [],
				tag: data.tag,
				requireInteraction: data.requireInteraction || false,
			};
		} catch (error) {
			console.error("[Worker] Error parsing push data:", error);
			try {
				notificationData.body = event.data.text();
			} catch (textError) {
				console.error("[Worker] Could not read data as text:", textError);
			}
		}
	}

	console.log("[Worker] Showing notification with data:", notificationData);

	const promiseChain = self.registration
		.showNotification(notificationData.title, {
			body: notificationData.body,
			icon: notificationData.icon,
			badge: notificationData.badge,
			image: notificationData.image,
			data: notificationData.data,
			actions: notificationData.actions,
			tag: notificationData.tag,
			requireInteraction: notificationData.requireInteraction,
		})
		.then(() => {
			console.log("[Worker] ✅ Notification shown successfully");
		})
		.catch((error) => {
			console.error("[Worker] ❌ Error showing notification:", error);
		});

	event.waitUntil(promiseChain);
});

// Notification click handler
self.addEventListener("notificationclick", function (event) {
	console.log("[Worker] Notification clicked:", event);

	event.notification.close();

	// Handle action button clicks
	if (event.action) {
		console.log("[Worker] Action clicked:", event.action);
		// Navigate to different pages based on action
		if (event.action === "open" && event.notification.data?.url) {
			event.waitUntil(clients.openWindow(event.notification.data.url));
			return;
		}
	}

	// Open or focus the app window
	event.waitUntil(
		clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then(function (clientList) {
				// Check if there's already a window open
				for (let i = 0; i < clientList.length; i++) {
					const client = clientList[i];
					if (client.url === "/" && "focus" in client) {
						return client.focus();
					}
				}
				// If not, open a new window
				if (clients.openWindow) {
					// Use notification data URL if available, otherwise default to '/'
					const url = event.notification.data?.url || "/";
					return clients.openWindow(url);
				}
			})
	);
});

// Notification close handler (optional)
self.addEventListener("notificationclose", function (event) {
	console.log("[Worker] Notification closed:", event);
	// You can track notification dismissals here if needed
});
