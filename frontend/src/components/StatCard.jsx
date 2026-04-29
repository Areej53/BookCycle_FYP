import React from "react";

const StatCard = ({ card }) => (
  <div
    style={{
      background: card.bg,
      borderRadius: 18,
      padding: "20px 20px 16px",
      position: "relative",
      overflow: "hidden",
      cursor: "pointer",
      transition: "all .18s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >

    <div style={{ fontSize: ".8rem", fontWeight: 600, color: "rgba(255,255,255,.75)", marginBottom: 14 }}>
      {card.label}
    </div>
    <div
      style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: "1.9rem",
        fontWeight: 900,
        color: "#fff",
        lineHeight: 1,
      }}
    >
      {card.val}
    </div>
    <div
      style={{
        position: "absolute",
        bottom: 14,
        right: 14,
        background: "rgba(255,255,255,.18)",
        color: "#fff",
        fontSize: ".68rem",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 50,
      }}
    >
      {card.badge}
    </div>
  </div>
);

export default StatCard;
