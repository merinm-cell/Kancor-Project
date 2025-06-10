import React from "react";

function IotTempLogo({ size = 80 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Sensor chip */}
      <rect x="10" y="10" width="60" height="60" rx="12" fill="#0a223a" stroke="#00f0ff" strokeWidth="3"/>
      {/* Temperature bulb */}
      <circle cx="40" cy="48" r="12" fill="#00f0ff" opacity="0.7"/>
      <rect x="36" y="22" width="8" height="26" rx="4" fill="#00f0ff" opacity="0.7"/>
      {/* Graph line */}
      <polyline
        points="22,58 32,38 44,50 54,28 62,38"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Small dots for graph */}
      <circle cx="22" cy="58" r="2" fill="#fff"/>
      <circle cx="32" cy="38" r="2" fill="#fff"/>
      <circle cx="44" cy="50" r="2" fill="#fff"/>
      <circle cx="54" cy="28" r="2" fill="#fff"/>
      <circle cx="62" cy="38" r="2" fill="#fff"/>
    </svg>
  );
}

export default IotTempLogo;