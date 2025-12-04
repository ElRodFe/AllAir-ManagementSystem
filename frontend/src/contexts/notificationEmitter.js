let notifyFn = null;

// Called by NotificationProvider
export function registerNotification(fn) {
  notifyFn = fn;
}

// Called by Axios
export function notificationEmitter(message, type = "error") {
  if (notifyFn) notifyFn(message, type);
}
