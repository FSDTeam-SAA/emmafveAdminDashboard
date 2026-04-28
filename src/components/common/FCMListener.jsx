import { useEffect } from "react";
import api from "../../utils/api";
import { requestForToken, onMessageListener } from "../../firebase";

const FCMListener = () => {
  // On mount: request permission, get FCM token, save to backend
  useEffect(() => {
    let isMounted = true;

    const fetchToken = async () => {
      try {
        const token = await requestForToken();
        if (token && isMounted) {
          await api.patch("/user/update-fcm-token", { fcmToken: token });
          console.log("[FCM] Token saved to server successfully.");
        }
      } catch (error) {
        console.error("[FCM] Error saving token to server:", error);
      }
    };

    fetchToken();

    return () => {
      isMounted = false;
    };
  }, []);

  // Keep foreground FCM listener alive but DON'T show a toast.
  // Socket (DashboardLayout) already handles real-time toasts when dashboard is open.
  // Background messages are handled by firebase-messaging-sw.js automatically.
  useEffect(() => {
    const setupListener = async () => {
      try {
        await onMessageListener();
        // Dispatch events for UI to refetch
        window.dispatchEvent(new Event("refetch-notifications"));
        window.dispatchEvent(new Event("refetch-stats"));
        // Silently re-subscribe for the next message
        setupListener();
      } catch (_) {
        // silent
      }
    };

    setupListener();
  }, []);

  return null;
};

export default FCMListener;
