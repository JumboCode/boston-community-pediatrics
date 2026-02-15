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
}

const Modal = ({ open, title, message, onClose, buttons = [] }: ModalProps) => {
  if (!open) return null;

  const variantStyles = {
    primary: "bg-[#234254] text-white hover:bg-[#1b3443] disabled:opacity-50",
    secondary: "bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white h-[336px] w-[792px] rounded-lg border-2 border-black-500 p-8 shadow-xl flex flex-col items-center justify-center text-center`}
      >
        {title && <h2 className="text-4xl mb-4">{title}</h2>}

        {message && (
          <p className="text-xl text-gray-700 mb-6 mt-4">{message}</p>
        )}

        {/* BUTTONS */}
        {buttons.length > 0 && (
          <div className={`flex gap-4 ${message ? "mt-5" : "mt-13"}`}>
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className={`px-12 py-2 rounded-md transition ${
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
