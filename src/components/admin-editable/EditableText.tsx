"use client";

import React, { useState } from "react";
import { SiteContentKey } from "@/lib/siteContent";
import { useIsAdmin } from "./useIsAdmin";
import { useSiteContent } from "./SiteContentProvider";
import PencilButton from "./PencilButton";

interface EditableTextProps {
  contentKey: SiteContentKey;
  fallbackText: string;
  className?: string;
  /**
   * Optional node rendered immediately before the editable text.
   * Used, for example, to keep a bold "Boston Community Pediatrics (BCP)" prefix.
   * The prefix itself is NOT editable by admins.
   */
  renderPrefix?: React.ReactNode;
  pencilClassName?: string;
  as?: "p" | "div" | "span";
}

export default function EditableText({
  contentKey,
  fallbackText,
  className = "",
  renderPrefix,
  pencilClassName = "absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 z-10",
  as = "div",
}: EditableTextProps) {
  const { isAdmin } = useIsAdmin();
  const { entry, setEntry } = useSiteContent(contentKey);
  const [modalOpen, setModalOpen] = useState(false);

  const text = entry?.value ?? fallbackText;
  const Tag = as;

  return (
    <div className="relative">
      <Tag className={className}>
        {renderPrefix}
        {text}
      </Tag>

      {isAdmin && (
        <PencilButton
          className={pencilClassName}
          onClick={() => setModalOpen(true)}
          label="Edit text"
        />
      )}

      {isAdmin && modalOpen && (
        <EditableTextModal
          contentKey={contentKey}
          initialText={text}
          renderPrefix={renderPrefix}
          onClose={() => setModalOpen(false)}
          onSaved={(updated) => {
            setEntry(updated);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface ModalProps {
  contentKey: SiteContentKey;
  initialText: string;
  renderPrefix?: React.ReactNode;
  onClose: () => void;
  onSaved: (entry: {
    key: SiteContentKey;
    type: "TEXT";
    value: string;
    url: null;
  }) => void;
}

function EditableTextModal({
  contentKey,
  initialText,
  renderPrefix,
  onClose,
  onSaved,
}: ModalProps) {
  const [draft, setDraft] = useState(initialText);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/site-content/${encodeURIComponent(contentKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: draft }),
        }
      );
      if (!res.ok) throw new Error("Failed to save text");
      const updated = await res.json();
      onSaved({
        key: contentKey,
        type: "TEXT",
        value: updated.value,
        url: null,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[720px] max-w-[92vw] rounded-lg border border-black p-6 shadow-xl flex flex-col relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-[#234254]">
          Edit text
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text
            </label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={10}
              className="w-full border border-gray-300 rounded-md p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#234254]"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Preview</p>
            <div className="border border-gray-200 rounded-md p-3 bg-gray-50 text-[#234254] text-base whitespace-pre-wrap">
              {renderPrefix}
              {draft}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-md border border-black bg-white text-black hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || draft === initialText}
              className="px-4 py-2 rounded-md border border-black bg-[#234254] text-white hover:bg-[#1b3443] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
