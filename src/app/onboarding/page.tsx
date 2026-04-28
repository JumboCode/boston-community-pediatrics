"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import BasicSkeleton from "@/components/ui/skeleton/BasicSkeleton";
import DatePicker from "@/components/DatePicker";

function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [checkingDb, setCheckingDb] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const todayYmd = new Date().toISOString().slice(0, 10);
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDateForInput = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseInputDate = (value: string): Date | null => {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(Date.UTC(year, month - 1, day));
  };

  const formatDateForDisplay = (value: string) => {
    if (!value) return "Select date";
    const date = parseInputDate(value);
    if (!date) return "Select date";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

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
    const dob = formData.get("dob") as string;

    if (dob && dob > todayYmd) {
      setError("Date of birth cannot be in the future.");
      setSubmitting(false);
      return;
    }

    const phone = formData.get("phone") as string;
    if (phone && (phone.length < 7 || phone.length > 15)) {
      setError("Phone number must be 7–15 digits.");
      setSubmitting(false);
      return;
    }

    const state = formData.get("state") as string;
    if (state && state.length !== 2) {
      setError("State must be exactly 2 characters.");
      setSubmitting(false);
      return;
    }

    const zip = formData.get("zip") as string;
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (zip && !zipRegex.test(zip)) {
      setError("Zip code must be 5-digit (12345) or 9-digit (12345-6789).");
      setSubmitting(false);
      return;
    }

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
            dateOfBirth: dob, // "YYYY-MM-DD"
            speaksSpanish: formData.get("speaksSpanish") === "true",
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
    return <BasicSkeleton />;
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
                maxLength={50}
                defaultValue={user?.firstName || ""}
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
                maxLength={50}
                defaultValue={user?.lastName || ""}
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
              inputMode="numeric"
              maxLength={15}
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
              }}
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
            <input name="dob" type="hidden" value={dob} />
            <div className="relative w-full">
              <button
                id="dob"
                type="button"
                onClick={() => setShowDatePicker((prev) => !prev)}
                className="w-full h-[43px] rounded-lg border border-medium-gray px-3 flex items-center justify-start text-left text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              >
                {formatDateForDisplay(dob)}
              </button>
              {showDatePicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDatePicker(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 z-50">
                    <DatePicker
                      selectedDate={parseInputDate(dob)}
                      onDateChange={(date) => {
                        setDob(formatDateForInput(date));
                        setShowDatePicker(false);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Languages (Optional) */}
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
                  required
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
                maxLength={50}
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
                maxLength={2}
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
                maxLength={10}
                inputMode="numeric"
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
              maxLength={100}
              className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !dob}
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
