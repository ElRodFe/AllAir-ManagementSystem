import { createContext, useContext, useState } from "react";
import { registerNotification } from "./notificationEmitter";
import NotificationItem from "../components/notifications/NotificationItem";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  function pushNotification(message, type = "error") {
    const id = Date.now();

    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }

  registerNotification(pushNotification);

  return (
    <NotificationContext.Provider value={{ pushNotification }}>
      {children}
      <div className="notifications-wrapper">
        {notifications.map((note) => (
          <NotificationItem key={note.id} note={note} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotificationContext);
}
