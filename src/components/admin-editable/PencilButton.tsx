"use client";

import React from "react";

interface PencilButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  /** Compact control for tight layouts (e.g. navbar logo). */
  size?: "sm" | "md";
}

export default function PencilButton({
  onClick,
  label = "Edit",
  className = "",
  size = "md",
}: PencilButtonProps) {
  const sizeClasses =
    size === "sm"
      ? "w-5 h-5 border-[0.5px] shadow-sm"
      : "w-8 h-8 shadow";
  const iconClasses = size === "sm" ? "w-2.5 h-2.5" : "w-4 h-4";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full bg-white/90 text-[#234254] border border-[#234254] hover:bg-white transition ${sizeClasses} ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClasses}
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </button>
  );
}
