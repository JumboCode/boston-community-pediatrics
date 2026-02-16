"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ProfilePlaceholder from "@/assets/icons/pfp-placeholder.svg"; // Ensure this path is correct

export default function EditProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          profileImageKey: data.profileImage || "",
        });

        // Resolve Image URL if exists
        if (data.profileImage) {
          // If it's a full URL, use it; otherwise fetch the public URL
          if (data.profileImage.startsWith("http")) {
            setPreviewUrl(data.profileImage);
          } else {
            const imgRes = await fetch(`/api/images?filename=${data.profileImage}`);
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
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Local preview
    }
  }

  // Handle Remove Image
  function handleRemoveImage() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setForm((prev) => ({ ...prev, profileImageKey: "" })); // Mark for deletion
  }

  // --- SUBMIT ---
  // --- SUBMIT ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = form.profileImageKey;

      // 1. Upload new image if selected
      if (selectedFile) {
        const uploadRes = await fetch("/api/upload-signup", {
          method: "POST",
          body: JSON.stringify({ fileType: selectedFile.type }),
        });

        if (uploadRes.ok) {
          const { uploadUrl, publicUrl } = await uploadRes.json();

          await fetch(uploadUrl, {
            method: "PUT",
            body: selectedFile,
            headers: { "Content-Type": selectedFile.type },
          });

          finalImageUrl = publicUrl;
        }
      }

      // 2. Update Database
      // WE CHANGED THE STRUCTURE HERE 👇
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
          }
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      router.push("/profile");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <main className="flex-grow flex justify-center items-start py-16 px-4">
        <div className="bg-white w-full max-w-[700px] border rounded-md shadow-sm p-10">

          <Link href="/profile">
            <div className="mb-6 text-gray-500 hover:text-gray-700 cursor-pointer">
              ← Back
            </div>
          </Link>

          <h1 className="text-2xl font-semibold text-center mb-10 text-[#234254]">
            Edit your profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First / Last Name */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-1">First Name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
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
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            {/* Spanish */}
            <div>
              <label className="block text-sm mb-2">Do you speak Spanish?</label>
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
              <label className="block text-sm mb-1">Street Address (optional)</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">City (optional)</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
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
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Zip code (optional)</label>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Profile Photo Logic */}
            <div className="flex items-center gap-8 pt-6">
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="w-[160px] h-[160px] border-2 border-dashed border-gray-300 flex items-center justify-center rounded-md overflow-hidden relative">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-sm">
                  Upload a profile photo (optional)
                </p>

                {/* Logic: If image exists, show Remove. Else show Upload. */}
                {previewUrl ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border px-4 py-1 rounded-md text-sm hover:bg-gray-100"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-100 border px-4 py-1 rounded-md text-sm hover:bg-gray-200"
                  >
                    Upload photo
                  </button>
                )}
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