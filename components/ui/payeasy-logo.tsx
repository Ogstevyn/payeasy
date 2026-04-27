"use client";

import React from "react";

interface PayEasyLogoProps {
  size?: number;
  className?: string;
}

export function PayEasyLogo({ size = 32, className }: PayEasyLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      {/* Logo Mark — shield with chain links */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="payeasy-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5c7cfa" />
            <stop offset="100%" stopColor="#20c997" />
          </linearGradient>
        </defs>
        {/* Shield shape */}
        <path
          d="M20 3L5 10V19C5 28.5 11.5 37.2 20 39C28.5 37.2 35 28.5 35 19V10L20 3Z"
          fill="url(#payeasy-grad)"
          fillOpacity="0.15"
          stroke="url(#payeasy-grad)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Chain / dollar symbol — simplified payment icon */}
        <path
          d="M20 12V14M20 26V28M16 18C16 16 17.8 14 20 14C22.2 14 24 15.5 24 17.5C24 19.5 22 20 20 20.5C18 21 16 21.5 16 23.5C16 25.5 17.8 27 20 27C22.2 27 24 25 24 23"
          stroke="url(#payeasy-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Blockchain nodes */}
        <circle cx="9" cy="15" r="1.5" fill="#5c7cfa" fillOpacity="0.6" />
        <circle cx="31" cy="15" r="1.5" fill="#20c997" fillOpacity="0.6" />
        <circle cx="9" cy="25" r="1.5" fill="#20c997" fillOpacity="0.6" />
        <circle cx="31" cy="25" r="1.5" fill="#5c7cfa" fillOpacity="0.6" />
      </svg>

      {/* Wordmark */}
      <span
        className="font-display"
        style={{
          fontWeight: 700,
          fontSize: `${size * 0.65}px`,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        <span style={{ color: "#f1f3f5" }}>Pay</span>
        <span
          style={{
            background: "linear-gradient(135deg, #5c7cfa 0%, #20c997 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Easy
        </span>
      </span>
    </div>
  );
}
