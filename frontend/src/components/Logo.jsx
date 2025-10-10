// src/components/Logo.jsx
import React from 'react';

export default function Logo({ className = "w-14 h-14" }) {
  return (
    <svg
      viewBox="0 0 400 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="200"
        cy="100"
        rx="180"
        ry="80"
        fill="#FFC857"
        transform="rotate(-10 200 100)"
      />
      
      <path
        d="M 350 50 L 360 60 L 350 70 L 340 60 Z"
        fill="#000"
      />
      <path
        d="M 320 130 L 328 136 L 320 142 L 312 136 Z"
        fill="#000"
      />
      <path
        d="M 380 110 L 386 114 L 380 118 L 374 114 Z"
        fill="#000"
      />

      <text
        x="200"
        y="130"
        fontFamily="Arial Black, sans-serif"
        fontSize="70"
        fontWeight="900"
        fill="#FFB3D9"
        stroke="#000"
        strokeWidth="4"
        textAnchor="middle"
      >
        IC-EASY
      </text>
    </svg>
  );
}