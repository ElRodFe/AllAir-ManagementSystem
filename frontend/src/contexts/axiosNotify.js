import { notificationEmitter } from "./notificationEmitter";

export function pushAxiosNotification(error) {
  const status = error.response?.status;

  if (!status) {
    return notificationEmitter("Network error - server unreachable", "error");
  }

  if (status === 404) {
    return notificationEmitter("Resource not found (404)", "warning");
  }

  if (status === 400) {
    return notificationEmitter("Bad request (400)", "error");
  }

  if (status >= 500) {
    return notificationEmitter("Server error (500+)", "error");
  }

  return notificationEmitter("Unexpected error occurred", "error");
}
