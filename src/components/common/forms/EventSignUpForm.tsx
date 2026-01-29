"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// --- Types ---
interface Guest {
  id: string;
  firstName: string; // Changed from fullName
  lastName: string;  // Changed from fullName
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
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
}

export default function EventSignUpForm({
  userData,
  positionData,
  eventName = "Event Name",
  eventDate = "00/00/0000",
  eventTime = "00:00 AM"
}: EventSignUpFormProps) {
  const router = useRouter();

  // --- State ---
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success & Waitlist States
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWaitlisted, setIsWaitlisted] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

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
  };

  const removeGuest = (id: string) => {
    setGuests(guests.filter((g) => g.id !== id));
  };

  const updateGuest = (id: string, field: keyof Guest, value: string) => {
    setGuests(guests.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  // --- API Submission ---
  const handleSignUp = async () => {
    // Simple validation check
    const isValid = guests.every(g => g.firstName && g.lastName && g.dateOfBirth && g.relationship);
    if (!isValid) {
      alert("Please fill in all required fields for guests (Name, DOB, Relationship).");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      userId: userData.id,
      positionId: positionData.id,
      guests: guests.map(({ id, ...rest }) => rest), // Sends firstName/lastName separately
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

      if (res.ok) {
        const responseData = await res.json();
        const record = responseData.data;

        if (!registrationId && record?.id) {
          setRegistrationId(record.id);
        }

        if (responseData.status === "waitlisted") {
          setIsWaitlisted(true);
        } else {
          setIsSuccess(true);
        }

        window.scrollTo(0, 0);
      } else {
        alert("Failed to sign up.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- WAITLIST VIEW COMPONENT ---
  if (isWaitlisted) {
    return (
      <div className="bg-[#5a718c] p-10 rounded-xl shadow-lg w-full max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl font-bold mb-2">You’ve been added to the waitlist!</h2>
        <p className="text-blue-100 mb-8">We’ll keep you updated!</p>
        <div className="bg-white text-left p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-6 mb-8 max-w-2xl mx-auto">
          <div className="w-32 h-24 bg-gray-200 rounded-sm shrink-0 mx-auto sm:mx-0" />
          <div className="text-gray-800 space-y-1 text-sm flex-1">
            <p><span className="font-bold">Event:</span> {eventName}</p>
            <p><span className="font-bold">Date:</span> {eventDate}</p>
            <p><span className="font-bold">Time:</span> {eventTime}</p>
            <p><span className="font-bold">Participants:</span> {1 + guests.length} (You + {guests.length} guests)</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setIsWaitlisted(false)} className="px-6 py-2.5 bg-[#34495e] text-white rounded font-bold text-sm uppercase tracking-wide hover:bg-[#2c3e50] transition shadow-sm">
            Edit details
          </button>
          <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-white text-[#34495e] rounded font-bold text-sm uppercase tracking-wide hover:bg-gray-50 transition shadow-sm">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // --- SUCCESS VIEW COMPONENT ---
  if (isSuccess) {
    return (
      <div className="bg-[#426982] p-10 rounded-xl shadow-lg w-full max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl font-bold mb-2">Thanks for signing up!</h2>
        <p className="text-blue-100 mb-8">A confirmation has been sent to your email.</p>
        <div className="bg-white text-left p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-6 mb-8 max-w-2xl mx-auto">
          <div className="w-32 h-24 bg-gray-200 rounded-sm shrink-0 mx-auto sm:mx-0" />
          <div className="text-gray-800 space-y-1 text-sm flex-1">
            <p><span className="font-bold">Event:</span> {eventName}</p>
            <p><span className="font-bold">Date:</span> {eventDate}</p>
            <p><span className="font-bold">Time:</span> {eventTime}</p>
            <p><span className="font-bold">Participants:</span> {1 + guests.length} (You + {guests.length} guests)</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setIsSuccess(false)} className="px-6 py-2.5 bg-[#35566b] text-white rounded font-bold text-sm uppercase tracking-wide hover:bg-[#2a4455] transition shadow-sm">
            Edit details
          </button>
          <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-white text-[#426982] rounded font-bold text-sm uppercase tracking-wide hover:bg-gray-50 transition shadow-sm">
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

      <p className="text-sm font-medium text-gray-900 mb-2">Your information</p>

      <div className="border border-gray-300 rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-sm shrink-0" />
          <div className="space-y-1.5 text-sm text-gray-800 pt-1">
            <p><span className="font-semibold text-gray-900">Name:</span> {userData.firstName} {userData.lastName}</p>
            <p><span className="font-semibold text-gray-900">Email:</span> {userData.emailAddress}</p>
            <p><span className="font-semibold text-gray-900">Phone:</span> {userData.phoneNumber}</p>
          </div>
        </div>
      </div>

      <div className="mb-10 text-sm">
        <p className="mb-1">You are currently signing up for <span className="font-bold">{positionData?.position}</span>.</p>
        <p className="text-gray-600"><span className="font-bold text-gray-900">Description:</span> {positionData?.description}</p>
      </div>

      <div className="space-y-10 mb-10">
        {guests.map((guest, index) => (
          <div key={guest.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="font-bold text-lg text-gray-900">Guest {index + 1}</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <div className="space-y-4">
              {/* SPLIT FIRST/LAST NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-[#426982] outline-none"
                    value={guest.firstName}
                    onChange={(e) => updateGuest(guest.id, "firstName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-[#426982] outline-none"
                    value={guest.lastName}
                    onChange={(e) => updateGuest(guest.id, "lastName", e.target.value)}
                  />
                </div>
              </div>

              {/* REQUIRED DOB and RELATIONSHIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Participant DOB <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-[#426982] outline-none text-gray-700"
                    value={guest.dateOfBirth}
                    onChange={(e) => updateGuest(guest.id, "dateOfBirth", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spouse, Child"
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-[#426982] outline-none"
                    value={guest.relationship}
                    onChange={(e) => updateGuest(guest.id, "relationship", e.target.value)}
                  />
                </div>
              </div>

              {/* OPTIONAL FIELDS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-[#426982] outline-none"
                  value={guest.email}
                  onChange={(e) => updateGuest(guest.id, "email", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (optional)</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-[#426982] outline-none"
                  value={guest.phoneNumber}
                  onChange={(e) => updateGuest(guest.id, "phoneNumber", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional comments</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-[#426982] outline-none resize-none"
                  value={guest.comments}
                  onChange={(e) => updateGuest(guest.id, "comments", e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => removeGuest(guest.id)}
                  className="text-gray-500 text-sm hover:text-red-600 flex items-center gap-1 border border-gray-200 px-3 py-1 rounded hover:border-red-200 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
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
          className="w-full py-3 bg-[#426982] text-white rounded font-bold text-sm uppercase tracking-wide hover:bg-[#35566b] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? (registrationId ? "Updating..." : "Signing up...")
            : (registrationId ? "Update Registration" : "Sign Up")}
        </button>
      </div>
    </div>
  );
}