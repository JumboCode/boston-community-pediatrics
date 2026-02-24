"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- Types ---
interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  speaksSpanish: boolean;
  relationship: string;
  comments: string;
}

interface EventSignUpFormProps {
  userData: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    dateOfBirth?: string;
  };
  positionData: {
    id: string;
    position: string;
    description: string;
  };
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  initialGuests?: Guest[];
  initialRegistrationId?: string | null;
}

export default function EventSignUpForm({
  userData,
  positionData,
  eventName = "Event Name",
  eventDate = "00/00/0000",
  eventTime = "00:00 AM",
  initialGuests = [],
  initialRegistrationId = null,
}: EventSignUpFormProps) {
  const router = useRouter();

  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [registrationId, setRegistrationId] = useState<string | null>(
    initialRegistrationId
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState(
    "We’ll keep you updated!"
  );

  useEffect(() => {
    if (initialGuests.length > 0) {
      const sanitizedGuests = initialGuests.map((g) => ({
        ...g,
        email: g.email ?? "", // Convert null to empty string
        phoneNumber: g.phoneNumber ?? "",
        speaksSpanish: g.speaksSpanish ?? false,
        relationship: g.relationship ?? "",
        comments: g.comments ?? "",
        dateOfBirth: g.dateOfBirth ?? "",
        firstName: g.firstName ?? "",
        lastName: g.lastName ?? "",
      }));
      setGuests(sanitizedGuests);
    }
    if (initialRegistrationId) setRegistrationId(initialRegistrationId);
  }, [initialGuests, initialRegistrationId]);

  // --- Guest Handlers ---
  const addGuest = () => {
    const newGuest: Guest = {
      id: crypto.randomUUID(),
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      relationship: "",
      comments: "",
    };
    setGuests([...guests, newGuest]);
    // Clear error if they add a guest (assuming they might be fixing a "too few guests" issue, though not applicable here)
    setErrorMessage(null);
  };

  const removeGuest = (id: string) => {
    setGuests(guests.filter((g) => g.id !== id));
    setErrorMessage(null);
  };

  const updateGuest = (id: string, field: keyof Guest, value: string) => {
    setGuests(guests.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  // --- API Submission ---
  const handleSignUp = async () => {
    setErrorMessage(null); // Reset errors on new submit

    // Simple validation check
    const isValid = guests.every(
      (g) => g.firstName && g.lastName && g.dateOfBirth && g.relationship
    );
    if (!isValid) {
      setErrorMessage(
        "Please fill in all required fields for guests (Name, DOB, Relationship)."
      );
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      userId: userData.id,
      positionId: positionData.id,
      guests: guests.map(({ id, ...rest }) => rest),
    };

    try {
      const method = registrationId ? "PUT" : "POST";
      const url = registrationId
        ? `/api/registrations?id=${registrationId}`
        : "/api/registrations";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      // 1. Handle Errors (400, 409, 500)
      if (!res.ok) {
        setErrorMessage(responseData.error || "An unexpected error occurred.");
        window.scrollTo(0, 0);
        setIsSubmitting(false);
        return;
      }

      // 2. Handle Success Scenarios
      const record = responseData.data;
      // --- NEW CODE (FIX) ---
      // Always update the ID because switching tables (Waitlist <-> Signup) changes the ID
      if (record?.id) {
        setRegistrationId(record.id);
      }

      if (responseData.status === "waitlisted") {
        setIsWaitlisted(true);
        setIsSuccess(false);
        setWaitlistMessage(
          "You are on the waitlist. We will notify you if a spot opens up."
        );
      } else if (responseData.status === "moved_to_waitlist") {
        // This is the specific PUT scenario
        setIsWaitlisted(true);
        setIsSuccess(false);
        setWaitlistMessage(
          responseData.message ||
            "Your update exceeded capacity, so you have been moved to the waitlist."
        );
      } else {
        // Registered
        setIsSuccess(true);
        setIsWaitlisted(false);
      }

      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      setErrorMessage("Network error. Please try again later.");
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- WAITLIST VIEW COMPONENT ---
  if (isWaitlisted) {
    return (
      <div className="bg-[#5a718c] p-10 rounded-xl shadow-lg w-full max-w-3xl mx-auto text-center text-white animate-in fade-in zoom-in duration-300">
        <h2 className="text-3xl font-bold mb-2">Waitlist Confirmed</h2>
        <p className="text-blue-100 mb-8 text-lg">{waitlistMessage}</p>

        <div className="bg-white text-left p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-6 mb-8 max-w-2xl mx-auto text-gray-800">
          <div className="w-32 h-24 bg-gray-200 rounded-sm shrink-0 mx-auto sm:mx-0 flex items-center justify-center text-gray-400 font-bold border border-gray-300">
            EVENT
          </div>
          <div className="space-y-1 text-sm flex-1">
            <p>
              <span className="font-bold text-gray-900">Event:</span>{" "}
              {eventName}
            </p>
            <p>
              <span className="font-bold text-gray-900">Date:</span> {eventDate}
            </p>
            <p>
              <span className="font-bold text-gray-900">Time:</span> {eventTime}
            </p>
            <p>
              <span className="font-bold text-gray-900">Total Group:</span>{" "}
              {1 + guests.length} (You + {guests.length} guests)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsWaitlisted(false)}
            className="px-6 py-2.5 bg-[#34495e] text-white rounded font-bold text-sm uppercase tracking-wide hover:bg-[#2c3e50] transition shadow-sm"
          >
            Edit details
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-white text-[#34495e] rounded font-bold text-sm uppercase tracking-wide hover:bg-gray-50 transition shadow-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // --- SUCCESS VIEW COMPONENT ---
  if (isSuccess) {
    return (
      <div className="bg-light-bcp-blue p-10 rounded-xl shadow-lg w-full max-w-3xl mx-auto text-center text-white animate-in fade-in zoom-in duration-300">
        <h2 className="text-3xl font-bold mb-2">Registration Confirmed!</h2>
        <p className="text-blue-100 mb-8">
          A confirmation has been sent to your email.
        </p>

        <div className="bg-white text-left p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-6 mb-8 max-w-2xl mx-auto text-gray-800">
          <div className="w-32 h-24 bg-gray-200 rounded-sm shrink-0 mx-auto sm:mx-0 flex items-center justify-center text-gray-400 font-bold border border-gray-300">
            EVENT
          </div>
          <div className="space-y-1 text-sm flex-1">
            <p>
              <span className="font-bold text-gray-900">Event:</span>{" "}
              {eventName}
            </p>
            <p>
              <span className="font-bold text-gray-900">Date:</span> {eventDate}
            </p>
            <p>
              <span className="font-bold text-gray-900">Time:</span> {eventTime}
            </p>
            <p>
              <span className="font-bold text-gray-900">Total Group:</span>{" "}
              {1 + guests.length} (You + {guests.length} guests)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsSuccess(false)}
            className="px-6 py-2.5 bg-[#35566b] text-white rounded font-bold text-sm uppercase tracking-wide hover:bg-[#2a4455] transition shadow-sm"
          >
            Edit details
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-white text-light-bcp-blue rounded font-bold text-sm uppercase tracking-wide hover:bg-gray-50 transition shadow-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // --- FORM VIEW (Standard) ---
  return (
    <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-[#1e293b] mb-8">
        {eventName}
      </h1>

      {/* ERROR ALERT BANNER */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-600 shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              There was a problem
            </h3>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      <p className="text-sm font-medium text-gray-900 mb-2">Your information</p>

      <div className="border border-gray-300 rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-sm shrink-0" />
          <div className="space-y-1.5 text-sm text-gray-800 pt-1">
            <p>
              <span className="font-semibold text-gray-900">Name:</span>{" "}
              {userData.firstName} {userData.lastName}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Email:</span>{" "}
              {userData.emailAddress}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Phone:</span>{" "}
              {userData.phoneNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-10 text-sm">
        <p className="mb-1">
          You are currently signing up for{" "}
          <span className="font-bold">{positionData?.position}</span>.
        </p>
        <p className="text-gray-600">
          <span className="font-bold text-gray-900">Description:</span>{" "}
          {positionData?.description}
        </p>
      </div>

      <div className="space-y-10 mb-10">
        {guests.map((guest, index) => (
          <div
            key={guest.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="font-bold text-lg text-gray-900">
                Guest {index + 1}
              </span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <div className="space-y-4">
              {/* SPLIT FIRST/LAST NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-light-bcp-blue outline-none"
                    value={guest.firstName}
                    onChange={(e) =>
                      updateGuest(guest.id, "firstName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-light-bcp-blue outline-none"
                    value={guest.lastName}
                    onChange={(e) =>
                      updateGuest(guest.id, "lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* REQUIRED DOB and RELATIONSHIP and SPEAKSPANISH */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participant DOB <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-light-bcp-blue outline-none text-gray-700"
                    value={guest.dateOfBirth}
                    onChange={(e) =>
                      updateGuest(guest.id, "dateOfBirth", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-row items-center gap-4 flex-wrap justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Does this person speak Spanish?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-row text-right gap-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`speaksSpanish-yes-${guest.id}`}
                        name={`speaksSpanish-${guest.id}`}
                        value="true"
                        className="accent-bcp-blue"
                        checked={guest.speaksSpanish === true}
                        onChange={() =>
                          updateGuest(guest.id, "speaksSpanish", true)
                        }
                      />
                      <label
                        htmlFor={`speaksSpanish-yes-${guest.id}`}
                        className="text-base font-normal text-medium-gray"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`speaksSpanish-no-${guest.id}`}
                        name={`speaksSpanish-${guest.id}`}
                        value="false"
                        className="accent-bcp-blue"
                        checked={guest.speaksSpanish === false}
                        onChange={() =>
                          updateGuest(guest.id, "speaksSpanish", false)
                        }
                      />
                      <label
                        htmlFor={`speaksSpanish-no-${guest.id}`}
                        className="text-base font-normal text-medium-gray"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spouse, Child"
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-light-bcp-blue outline-none"
                    value={guest.relationship}
                    onChange={(e) =>
                      updateGuest(guest.id, "relationship", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* OPTIONAL FIELDS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-light-bcp-blue outline-none"
                  value={guest.email || ""}
                  onChange={(e) =>
                    updateGuest(guest.id, "email", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-light-bcp-blue outline-none"
                  value={guest.phoneNumber || ""}
                  onChange={(e) =>
                    updateGuest(guest.id, "phoneNumber", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional comments
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-light-bcp-blue outline-none resize-none"
                  value={guest.comments || ""}
                  onChange={(e) =>
                    updateGuest(guest.id, "comments", e.target.value)
                  }
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => removeGuest(guest.id)}
                  className="text-gray-500 text-sm hover:text-red-600 flex items-center gap-1 border border-gray-200 px-3 py-1 rounded hover:border-red-200 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Remove participant
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addGuest}
        className="w-full py-3 mb-8 border border-gray-400 rounded text-gray-800 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        + Add a guest
      </button>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="w-full py-3 border border-gray-800 rounded text-gray-900 font-bold text-sm uppercase tracking-wide hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleSignUp}
          disabled={isSubmitting}
          className="w-full py-3 bg-light-bcp-blue text-white rounded font-bold text-sm uppercase tracking-wide hover:bg-[#35566b] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? registrationId
              ? "Updating..."
              : "Signing up..."
            : registrationId
              ? "Update Registration"
              : "Sign Up"}
        </button>
      </div>
    </div>
  );
}