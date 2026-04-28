"use client";

import React, { CSSProperties, useEffect, useRef, useState } from "react";
import Image, { ImageProps } from "next/image";
import Link from "next/link";
import { SiteContentKey } from "@/lib/siteContent";
import { useIsAdmin } from "./useIsAdmin";
import { useSiteContent } from "./SiteContentProvider";
import PencilButton from "./PencilButton";

type PassthroughImageProps = Omit<ImageProps, "src" | "alt"> & {
  alt: string;
};

interface EditableImageProps extends PassthroughImageProps {
  contentKey: SiteContentKey;
  fallbackSrc: ImageProps["src"];
  /**
   * Extra class name for the wrapper that positions the pencil button.
   * Defaults to an inline-block wrapper that matches the image size.
   */
  wrapperClassName?: string;
  pencilClassName?: string;
  /**
   * If provided, the image is wrapped in a Next Link to this href.
   * The pencil button lives OUTSIDE the link so clicking it never navigates.
   */
  href?: string;
  linkClassName?: string;
  pencilSize?: "sm" | "md";
}

export default function EditableImage({
  contentKey,
  fallbackSrc,
  wrapperClassName = "",
  pencilClassName = "absolute bottom-2 right-2 z-10",
  href,
  linkClassName,
  pencilSize = "md",
  ...imageProps
}: EditableImageProps) {
  const { isAdmin } = useIsAdmin();
  const { entry, setEntry, removeEntry } = useSiteContent(contentKey);
  const [modalOpen, setModalOpen] = useState(false);

  const remoteUrl = entry?.url ?? null;

  const imageEl = remoteUrl ? (
    // Remote/uploaded images: use a plain <img> so we don't have to
    // require explicit width/height when the caller relies on CSS sizing.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={remoteUrl}
      alt={imageProps.alt}
      className={imageProps.className}
      style={imageProps.style as CSSProperties | undefined}
      width={
        typeof imageProps.width === "number" ? imageProps.width : undefined
      }
      height={
        typeof imageProps.height === "number" ? imageProps.height : undefined
      }
    />
  ) : (
    <Image {...imageProps} src={fallbackSrc} alt={imageProps.alt} />
  );

  return (
    <div className={`relative inline-block ${wrapperClassName}`}>
      {href ? (
        <Link href={href} className={linkClassName}>
          {imageEl}
        </Link>
      ) : (
        imageEl
      )}

      {isAdmin && (
        <PencilButton
          className={pencilClassName}
          size={pencilSize}
          onClick={() => setModalOpen(true)}
          label="Edit image"
        />
      )}

      {isAdmin && modalOpen && (
        <EditableImageModal
          contentKey={contentKey}
          currentSrc={remoteUrl ?? resolveStaticSrc(fallbackSrc)}
          alt={imageProps.alt}
          hasCustomValue={Boolean(remoteUrl)}
          onClose={() => setModalOpen(false)}
          onSaved={(updated) => {
            setEntry(updated);
            setModalOpen(false);
          }}
          onReset={() => {
            removeEntry(contentKey);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function resolveStaticSrc(src: ImageProps["src"]): string | null {
  if (typeof src === "string") return src;
  if (src && typeof src === "object" && "src" in src) {
    return (src as { src: string }).src;
  }
  return null;
}

interface ModalProps {
  contentKey: SiteContentKey;
  currentSrc: string | null;
  alt: string;
  hasCustomValue: boolean;
  onClose: () => void;
  onSaved: (entry: {
    key: SiteContentKey;
    type: "IMAGE";
    value: string;
    url: string;
  }) => void;
  onReset: () => void;
}

function EditableImageModal({
  contentKey,
  currentSrc,
  alt,
  hasCustomValue,
  onClose,
  onSaved,
  onReset,
}: ModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setFile(null);
    setPreviewUrl(null);
    setError(null);

    if (!f) return;

    if (!["image/jpeg"].includes(f.type)) {
      setError("Only JPG/JPEG images are allowed.");
      e.target.value = "";
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (f.size > MAX_SIZE) {
      setError("Image must be 5MB or less.");
      e.target.value = "";
      return;
    }

    setFile(f);
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setPreviewUrl(url);
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    setError(null);
    try {
      const uploadRes = await fetch(
        `/api/site-content/${encodeURIComponent(contentKey)}/upload`,
        { method: "POST" }
      );
      if (!uploadRes.ok) throw new Error("Failed to get upload URL");
      const { key: imageKey, url: presignedUrl } = (await uploadRes.json()) as {
        key: string;
        url: string;
      };

      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!putRes.ok) throw new Error("Failed to upload file");

      const patchRes = await fetch(
        `/api/site-content/${encodeURIComponent(contentKey)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageKey }),
        }
      );
      if (!patchRes.ok) throw new Error("Failed to save image");
      const updated = await patchRes.json();
      onSaved({
        key: contentKey,
        type: "IMAGE",
        value: updated.value,
        url: updated.url,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Reset this image to the site default? The current image will be removed."
      )
    ) {
      return;
    }
    setResetting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/site-content/${encodeURIComponent(contentKey)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to reset image");
      onReset();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setResetting(false);
    }
  };

  const busy = saving || resetting;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[600px] max-w-[92vw] rounded-lg border border-black p-6 shadow-xl flex flex-col relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-light leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-[#234254]">
          Edit image
        </h2>

        <div className="flex flex-col gap-4">
          <div className="w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded p-3 min-h-[160px]">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`${alt} preview`}
                className="max-h-64 max-w-full object-contain"
              />
            ) : currentSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentSrc}
                alt={`${alt} current`}
                className="max-h-64 max-w-full object-contain opacity-80"
              />
            ) : (
              <span className="text-gray-500 text-sm">No image selected</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Choose a new image
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={onFileChange}
              className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-[#234254] file:text-white hover:file:bg-[#1b3443]"
            />
            <p className="text-xs text-gray-500 mt-1">
              JPG/JPEG only, max 5MB. Preview will appear above. Click Save to publish.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3 mt-2">
            {hasCustomValue && (
              <button
                onClick={handleReset}
                disabled={busy}
                className="px-4 py-2 rounded-md border border-red-600 bg-white text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {resetting ? "Resetting..." : "Reset to default"}
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                onClick={onClose}
                disabled={busy}
                className="px-4 py-2 rounded-md border border-black bg-white text-black hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!file || busy}
                className="px-4 py-2 rounded-md border border-black bg-[#234254] text-white hover:bg-[#1b3443] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
