"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function EditProfilePage() {
  const [form, setForm] = useState({
    firstName: "Volunteer Name",
    lastName: "",
    email: "volunteer123@gmail.com",
    phone: "",
    dob: "",
    spanish: "",
    address: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(form);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Content */}
      <main className="flex-grow flex justify-center items-start py-16 px-4">
        <div className="bg-white w-full max-w-[700px] border rounded-md shadow-sm p-10">
          {/* Back Arrow */}
          <Link href="/profile">
            <div className="mb-6 text-gray-500 hover:text-gray-700 cursor-pointer">
              ←
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

            {/* Email */}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm"
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
              <label className="block text-sm mb-2">
                Do you speak Spanish?
              </label>
              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.spanish === "yes"}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        spanish: "yes",
                      }))
                    }
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.spanish === "no"}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        spanish: "no",
                      }))
                    }
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
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Apt, suite, etc (optional)
              </label>
              <input
                name="apt"
                value={form.apt}
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

            {/* State / Zip */}
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
                <label className="block text-sm mb-1">
                  Zip code (optional)
                </label>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Profile Photo */}
            <div className="flex items-center gap-8 pt-6">
              <div className="w-[160px] h-[160px] border-2 border-dashed border-gray-300 flex items-center justify-center rounded-md">
                <span className="text-gray-400 text-sm">Image</span>
              </div>

              <div>
                <p className="text-sm mb-2">
                  Upload a profile photo (optional)
                </p>
                <button
                  type="button"
                  className="border px-4 py-1 rounded-md text-sm hover:bg-gray-100"
                >
                  Remove photo
                </button>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                className="bg-[#234254] text-white px-6 py-2 rounded-md text-sm hover:bg-[#1b3443]"
              >
                Save details
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
