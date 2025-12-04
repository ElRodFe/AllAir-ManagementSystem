import "./Notifications.css";
import { useEffect, useState } from "react";

export default function NotificationItem({ note }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFade(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const icons = {
    success: "/assets/sucess.svg",
    error: "/assets/error.svg",
    warning: "/assets/warn.svg",
    info: "/assets/info.svg",
  };

  return (
    <div className={`notification ${note.type} ${fade ? "fade-out" : ""}`}>
      <span className="icon">
        <img src={icons[note.type]} alt={`notification ${note.type}`} />
      </span>
      <span>{note.message}</span>
    </div>
  );
}
