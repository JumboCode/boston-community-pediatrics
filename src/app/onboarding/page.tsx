"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";

function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [checkingDb, setCheckingDb] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if user already exists in Postgres
  useEffect(() => {
    if (isLoaded && user) {
      const checkUser = async () => {
        try {
          // Attempt to fetch user by Clerk ID
          const res = await fetch(`/api/users?id=${user.id}`);

          if (res.ok) {
            // User exists! Redirect to dashboard immediately.
            router.push("/");
          } else {
            // User not found (404), so we must show this form.
            setCheckingDb(false);
          }
        } catch (err) {
          console.error("Error checking user:", err);
          setCheckingDb(false); // Fallback to showing form
        }
      };
      checkUser();
    }
  }, [isLoaded, user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!user) return;

    const formData = new FormData(e.currentTarget);

    try {
      // POST to your existing API to create the user record
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            id: user.id, // Clerk ID
            // NOW USING FORM DATA (Handles nulls from Google)
            firstName: formData.get("first-name"),
            lastName: formData.get("last-name"),
            emailAddress: user.primaryEmailAddress?.emailAddress,
            // User inputs these now
            phoneNumber: formData.get("phone"),
            dateOfBirth: formData.get("dob"), // "YYYY-MM-DD"
            languages: formData.get("languages"),
            streetAddress: formData.get("street"),
            city: formData.get("city"),
            state: formData.get("state"),
            zipCode: formData.get("zip"),
            role: UserRole.VOLUNTEER,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      // Success -> Dashboard
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded || checkingDb) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-bcp-blue">Checking profile...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-20">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center border border-medium-gray rounded-lg w-[792px] p-10"
      >
        <h1 className="text-bcp-blue text-[36px] font-medium mb-2 text-center">
          Complete Your Profile
        </h1>
        <p className="text-black text-xl mb-10 text-center">
          Just a few more details to finish your registration.
        </p>

        <div className="flex flex-col gap-6 w-[80%]">
          {/* Pre-filled info (Visual only) */}
          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-500">Signing in as:</p>
            <p className="font-medium">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          {/* ADDED: First / Last Name (Required) */}
          <div className="flex flex-row gap-[20px]">
            <div className="flex flex-col items-start flex-1">
              <label
                htmlFor="first-name"
                className="text-base font-normal text-medium-gray mb-1"
              >
                First Name
              </label>
              <input
                name="first-name"
                id="first-name"
                required
                defaultValue={user?.firstName || ""} // Pre-fill if Google provided it
                className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
            <div className="flex flex-col items-start flex-1">
              <label
                htmlFor="last-name"
                className="text-base font-normal text-medium-gray mb-1"
              >
                Last Name
              </label>
              <input
                name="last-name"
                id="last-name"
                required
                defaultValue={user?.lastName || ""} // Pre-fill if Google provided it
                className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
          </div>

          {/* Phone (Required) */}
          <div className="flex flex-col items-start">
            <label
              htmlFor="phone"
              className="text-base font-normal text-medium-gray mb-1"
            >
              Phone Number
            </label>
            <input
              name="phone"
              id="phone"
              type="tel"
              required
              className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>

          {/* DOB (Required) */}
          <div className="flex flex-col items-start">
            <label
              htmlFor="dob"
              className="text-base font-normal text-medium-gray mb-1"
            >
              Date of Birth
            </label>
            <input
              name="dob"
              id="dob"
              type="date"
              required
              className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>

          {/* Languages */}
          <div className="flex flex-row items-start justify-between">
            <label
              htmlFor="speakSpanish"
              className="text-base font-normal text-medium-gray mb-1"
            >
              Do you speak Spanish?
            </label>
            <div className="flex flex-row items-center justify-between gap-[48px]">
              <div className="flex flex-row items-center gap-[14px]">
                <input
                  // type="checkbox"
                  type="radio"
                  name="speaksSpanish"
                  value="true"
                  className="accent-bcp-blue rounded-md"
                />
                <label
                  htmlFor="speaksSpanish"
                  className="flex flex-row text-base font-normal text-medium-gray mb-1"
                >
                  Yes
                </label>
              </div>
              <div className="flex flex-row items-center gap-[14px]">
                <input
                  type="radio"
                  // type="checkbox"
                  className="accent-bcp-blue rounded-md"
                  name="speaksSpanish"
                  value="false"
                />
                <label
                  htmlFor="speaksSpanish"
                  className="text-base font-normal text-medium-gray mb-1 gap-14"
                >
                  No
                </label>
              </div>
            </div>
          </div>

          {/* City/State/Zip (Optional) */}
          <div className="flex flex-row gap-4">
            <div className="flex flex-col items-start flex-1">
              <label
                htmlFor="city"
                className="text-base font-normal text-medium-gray mb-1"
              >
                City (optional)
              </label>
              <input
                name="city"
                id="city"
                className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
            <div className="flex flex-col items-start w-[120px]">
              <label
                htmlFor="state"
                className="text-base font-normal text-medium-gray mb-1"
              >
                State (optional)
              </label>
              <input
                name="state"
                id="state"
                className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
            <div className="flex flex-col items-start w-[140px]">
              <label
                htmlFor="zip"
                className="text-base font-normal text-medium-gray mb-1"
              >
                Zip (optional)
              </label>
              <input
                name="zip"
                id="zip"
                className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
          </div>

          {/* Street (Optional) */}
          <div className="flex flex-col items-start">
            <label
              htmlFor="street"
              className="text-base font-normal text-medium-gray mb-1"
            >
              Street Address (optional)
            </label>
            <input
              name="street"
              id="street"
              className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-bcp-blue text-white rounded-lg disabled:opacity-50 hover:bg-text-white transition-colors mt-4"
          >
            {submitting ? "Creating Profile..." : "Finish Registration"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OnboardingPage;
