import React from "react";
import { PALETTE } from "../constants";

const NotificationItem = ({ notification, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      textAlign: "left",
      border: `1px solid ${PALETTE.border}`,
      background: notification.isRead ? PALETTE.bg : "rgba(221,161,94,.15)",
      borderRadius: 12,
      padding: "10px 12px",
      cursor: "pointer",
      marginBottom: 8,
    }}
  >
    <div style={{ fontWeight: notification.isRead ? 600 : 800, color: PALETTE.text, fontSize: ".82rem" }}>
      {notification.message}
    </div>
    <div style={{ fontSize: ".72rem", color: PALETTE.muted, marginTop: 4 }}>
      {new Date(notification.createdAt).toLocaleString()}
    </div>
  </button>
);

export default NotificationItem;
