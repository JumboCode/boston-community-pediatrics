"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import BasicSkeleton from "@/components/ui/skeleton/BasicSkeleton";
import DatePicker from "@/components/DatePicker";

export default function EditProfilePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emptyFields, setEmptyFields] = useState<Set<string>>(new Set());
  const todayYmd = new Date().toISOString().slice(0, 10);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form State
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    spanish: "no", // 'yes' | 'no'
    address: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
    profileImageKey: "", // Stores the DB "key" or URL
  });

  // Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Error State
  const [error, setError] = useState<string>("");

  const normalizeProfileImageUrl = (value?: string | null) => {
    if (!value) return value ?? null;
    if (!value.startsWith("http")) return value;
    try {
      const url = new URL(value);
      url.pathname = url.pathname.replace(/\/{2,}/g, "/");
      return url.toString();
    } catch {
      return value;
    }
  };

  // --- 1. FETCH USER DATA ---
  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/users?id=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        // Populate Form
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.emailAddress || "",
          phone: data.phoneNumber || "",
          // Convert ISO date (YYYY-MM-DDTHH:mm...) to YYYY-MM-DD for input
          dob: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          spanish: data.speaksSpanish ? "yes" : "no",
          address: data.streetAddress || "",
          apt: "", // Note: Prisma model doesn't seem to have 'apt', assuming mixed into street or missing
          city: data.city || "",
          state: data.state || "",
          zip: data.zipCode || "",
          profileImageKey: normalizeProfileImageUrl(data.profileImage) || "",
        });

        // Resolve Image URL if exists
        if (data.profileImage) {
          // If it's a full URL, use it; otherwise fetch the public URL
          if (data.profileImage.startsWith("http")) {
            setPreviewUrl(normalizeProfileImageUrl(data.profileImage));
          } else {
            const imgRes = await fetch(
              `/api/images?filename=${data.profileImage}`
            );
            const imgData = await imgRes.json();
            setPreviewUrl(imgData.url);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) fetchData();
  }, [isLoaded, user?.id]);

  // --- HANDLERS ---
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Handle File Selection
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED_TYPES = ["image/jpeg"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG/JPEG images are allowed.");
      e.target.value = "";
      return;
    }

    const MAX_SIZE = 1 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError("Image must be 1MB or less.");
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, profileImageKey: file.name }));
  }

  // Handle Remove Image
  function handleRemoveImage() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setForm((prev) => ({ ...prev, profileImageKey: "" })); // Mark for deletion
  }

  // Handle Date Selection from DatePicker
  function handleDateSelect(date: Date) {
    // Use UTC methods to prevent timezone offset issues
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD
    setForm((prev) => ({ ...prev, dob: formattedDate }));
    setShowDatePicker(false);
  }

  // Format date for display
  function formatDateForDisplay(dateString: string) {
    if (!dateString) return "";
    // Parse as UTC to prevent timezone offset
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  // --- SUBMIT ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    const newEmptyFields = new Set<string>();
    if (!form.firstName) newEmptyFields.add("firstName");
    if (!form.lastName) newEmptyFields.add("lastName");
    if (!form.phone) newEmptyFields.add("phone");
    if (!form.dob) newEmptyFields.add("dob");

    if (form.phone && (form.phone.length < 7 || form.phone.length > 15)) {
      setError("Phone number must be 7–15 digits.");
      return;
    }

    if (form.dob && form.dob > todayYmd) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    if (form.state && form.state.length !== 2) {
      setError("State must be exactly 2 characters.");
      return;
    }

    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (form.zip && !zipRegex.test(form.zip)) {
      setError("Zip code must be 5-digit (12345) or 9-digit (12345-6789).");
      return;
    }

    if (newEmptyFields.size > 0) {
      setEmptyFields(newEmptyFields);
      return;
    }

    setEmptyFields(new Set());
    setSaving(true);
    setError("");

    try {
      let finalImageUrl = form.profileImageKey
        ? normalizeProfileImageUrl(form.profileImageKey)
        : selectedFile
          ? previewUrl || ""
          : null;

      // 1. Upload new image if selected
      if (selectedFile) {
        const uploadRes = await fetch("/api/upload-signup", {
          method: "POST",
          body: JSON.stringify({ fileType: selectedFile.type }),
        });

        if (uploadRes.ok) {
          const { uploadUrl, publicUrl } = await uploadRes.json();

          const uploadToR2Res = await fetch(uploadUrl, {
            method: "PUT",
            body: selectedFile,
            headers: { "Content-Type": selectedFile.type },
          });
          if (!uploadToR2Res.ok) {
            throw new Error("Failed to upload profile image");
          }

          finalImageUrl = normalizeProfileImageUrl(publicUrl) || "";
          setForm((prev) => ({ ...prev, profileImageKey: publicUrl }));
        }
      }

      // 2. Update Database
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          // The backend expects the data to be wrapped in a "body" key
          body: {
            firstName: form.firstName,
            lastName: form.lastName,
            phoneNumber: form.phone,
            dateOfBirth: form.dob ? new Date(form.dob).toISOString() : null,
            speaksSpanish: form.spanish === "yes",
            streetAddress: form.address,
            city: form.city,
            state: form.state,
            zipCode: form.zip,
            profileImage: previewUrl ? finalImageUrl : null,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update");
      }

      router.push("/profile");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !isLoaded) {
    return <BasicSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <main className="flex-grow flex justify-center items-start py-16 px-4">
        <div className="bg-white w-full max-w-[700px] border rounded-md shadow-sm p-10">
          <Link href="/profile">
            <div className="mb-6 text-3xl text-gray-500 hover:text-gray-700 cursor-pointer">
              ←
            </div>
          </Link>

          <h1 className="text-2xl font-semibold text-center mb-10 text-[#234254]">
            Edit your profile
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First / Last Name */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-1">First Name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  maxLength={50}
                  className={`w-full border rounded-md px-3 py-2 text-sm ${
                    emptyFields.has("firstName")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {emptyFields.has("firstName") && (
                  <p className="text-red-500 text-sm mt-1">
                    Please complete this field
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  maxLength={50}
                  className={`w-full border rounded-md px-3 py-2 text-sm ${
                    emptyFields.has("lastName")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {emptyFields.has("lastName") && (
                  <p className="text-red-500 text-sm mt-1">
                    Please complete this field
                  </p>
                )}
              </div>
            </div>

            {/* Email (READ ONLY) */}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                disabled
                className="w-full border rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm mb-1">Phone Number</label>
              <input
                name="phone"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: e.target.value.replace(/\D/g, ""),
                  }))
                }
                maxLength={15}
                className={`w-full border rounded-md px-3 py-2 text-sm ${
                  emptyFields.has("phone")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {emptyFields.has("phone") && (
                <p className="text-red-500 text-sm mt-1">
                  Please complete this field
                </p>
              )}
            </div>

            {/* DOB with Custom DatePicker */}
            <div className="relative">
              <label className="block text-sm mb-1">Date of Birth</label>
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`w-full border rounded-md px-3 py-2 text-sm text-left bg-white hover:bg-gray-50 transition-colors ${
                  emptyFields.has("dob") ? "border-red-500" : "border-gray-300"
                }`}
              >
                {form.dob ? formatDateForDisplay(form.dob) : "Select date"}
              </button>

              {emptyFields.has("dob") && (
                <p className="text-red-500 text-sm mt-1">
                  Please complete this field
                </p>
              )}

              {showDatePicker && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDatePicker(false)}
                  />
                  {/* DatePicker Dropdown */}
                  <div className="absolute top-full left-0 mt-2 z-50">
                    <DatePicker
                      selectedDate={
                        form.dob
                          ? (() => {
                              const [year, month, day] = form.dob
                                .split("-")
                                .map(Number);
                              return new Date(Date.UTC(year, month - 1, day));
                            })()
                          : null
                      }
                      onDateChange={handleDateSelect}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Spanish */}
            <div className="flex justify-between items-center">
              <label className="text-sm">Do you speak Spanish?</label>
              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="spanish"
                    value="yes"
                    checked={form.spanish === "yes"}
                    onChange={handleChange}
                    className="accent-[#234254]"
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="spanish"
                    value="no"
                    checked={form.spanish === "no"}
                    onChange={handleChange}
                    className="accent-[#234254]"
                  />
                  No
                </label>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm mb-1">
                Street Address (optional)
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                maxLength={100}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">City (optional)</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                maxLength={50}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-1">State (optional)</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  maxLength={2}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Zip code (optional)
                </label>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Profile Photo Logic */}
            <div className="flex gap-6 mt-6 items-center">
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept=".jpg,.jpeg"
                onChange={handleFileChange}
              />

              {/* Left: Dashed Box - capped width, centered */}
              <div className="flex-1 flex justify-center max-w-[50%]">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-[160px] h-[160px] border-2 border-dashed border-gray-500 rounded flex items-center justify-center bg-[#f9f9f9] cursor-pointer hover:bg-gray-100 transition-colors shrink-0 overflow-hidden relative"
                >
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Landscape Icon Placeholder
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#333"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Right: Text & Controls - centered in right half */}
              <div className="flex-1 flex justify-center max-w-[50%]">
                <div className="flex flex-col justify-center">
                  <p className="text-[16px] font-medium text-gray-700 mb-4 leading-tight">
                    Upload a profile photo
                    <br />
                    (optional)
                  </p>

                  <div>
                    {previewUrl ? (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-4 py-2 border border-gray-400 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Remove photo
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-400 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Upload photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#234254] text-white px-6 py-2 rounded-md text-sm hover:bg-[#1b3443] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save details"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
