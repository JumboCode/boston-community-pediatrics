"use client";
import React, { useRef } from "react";
import Image from "next/image";

const DEFAULT_DEBOUNCE_MS = 500;

interface ButtonProps {
  label: string;
  onClick?: () => void;
  leftIconPath?: string;
  rightIconPath?: string;
  altStyle?: string;
  altTextStyle?: string;
  disabled?: boolean;
  type?: HTMLButtonElement["type"];
  debounceMs?: number;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  leftIconPath,
  rightIconPath,
  altStyle,
  altTextStyle,
  disabled,
  type,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}) => {
  const debouncing = useRef(false);

  const handleClick = () => {
    if (!onClick || debouncing.current) return;
    debouncing.current = true;
    onClick();
    setTimeout(() => {
      debouncing.current = false;
    }, debounceMs);
  };

  return (
    <button
      type={type ?? "button"}
      onClick={handleClick}
      disabled={disabled}
      className={
        altStyle
          ? altStyle
          : "text-white bg-bcp-blue font-medium rounded text-sm px-5.5 py-3 text-center hover:bg-[#4B7B96]-600 focus:outline-[#1a91d6] focus:bg-bcp-blue active:bg-[#071823] disabled:opacity-75 disabled:bg-[#6D808B]"
      }
    >
      {leftIconPath ? (
        <Image src={leftIconPath} alt={altTextStyle ? altTextStyle : ""} />
      ) : null}
      {label}
      {rightIconPath ? <Image src={rightIconPath} alt="" /> : null}
    </button>
  );
};

export default Button;
