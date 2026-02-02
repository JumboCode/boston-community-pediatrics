import { useEffect, useRef, useState } from "react";

export type KebabMenuItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

type KebabMenuProps = {
  items: KebabMenuItem[];
};

export function KebabMenu({ items }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Kebab button */}
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* 3 dots */}
        <svg
          className="w-5 h-5 text-gray-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>

      {/* Menu */}
      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-[120px] rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
          role="menu"
        >
          {items.map((item, index) => (
            <div key={item.label}>
              <button
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100
        ${item.danger ? "text-red-600" : "text-gray-700"}`}
              >
                {item.label}
              </button>

              {/* Divider */}
              {index < items.length - 1 && <div className="h-px bg-gray-200" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
