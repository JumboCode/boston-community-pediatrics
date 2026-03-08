import React from "react";

interface ModalButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
}

interface ModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  buttons?: ModalButton[];
  description?: string | React.ReactNode;
  layout?: "center" | "custom";
}

const Modal = ({
  open,
  title,
  message,
  onClose,
  description,
  buttons = [],
  layout = "center",
}: ModalProps) => {
  if (!open) return null;

  const variantStyles = {
    primary: "bg-[#234254] text-white hover:bg-[#1b3443] disabled:opacity-50",
    secondary:
      "bg-white text-black border-2 border-black hover:bg-gray-50 disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-[792px] rounded-lg border border-black p-8 shadow-xl flex flex-col ${
          layout === "center" ? "items-center text-center" : ""
        }`}
      >
        {title && <h2 className="text-4xl mb-4">{title}</h2>}

        {description && (
          <div
            className={
              layout === "center"
                ? "text-xl text-gray-700 mb-2 mt-1 whitespace-pre-line"
                : "w-full"
            }
          >
            {description}
          </div>
        )}

        {message && (
          <p className="text-xl text-gray-700 mb-6 mt-4">{message}</p>
        )}

        {/* BUTTONS */}
        {buttons.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className={`px-6 py-2 rounded-md border border-black transition ${
                  variantStyles[btn.variant || "primary"]
                }`}
                disabled={btn.disabled || btn.loading}
              >
                {btn.loading ? "Loading..." : btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
