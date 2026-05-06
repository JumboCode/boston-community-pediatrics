"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import blankProfile from "@/assets/icons/Group 1.svg";
import DatePicker from "@/components/DatePicker";

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
}

interface EventSignUpFormProps {
  userData?: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    dateOfBirth?: string;
    profileImage?: string | null;
  } | null;
  positionData: {
    id: string;
    position: string;
    description: string;
  };
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  eventImage?: string;
  initialGuests?: Guest[];
  initialRegistrationId?: string | null;
}

export default function EventSignUpForm({
  userData,
  positionData,
  eventName = "Event Name",
  eventDate = "00/00/0000",
  eventTime = "00:00 AM",
  eventImage,
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
    "We'll keep you updated!"
  );
  const [comment, setComment] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState<{
    [guestId: string]: boolean;
  }>({});

  const todayYmd = new Date().toISOString().slice(0, 10);
  const MAX_NAME = 50;
  const MAX_RELATIONSHIP = 50;
  const MAX_PHONE = 15;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Use the URL directly — no getPublicURL needed
  const profileImageSrc = userData?.profileImage || blankProfile;

  useEffect(() => {
    if (initialGuests.length > 0) {
      const sanitizedGuests = initialGuests.map((g) => ({
        ...g,
        email: g.email ?? "",
        phoneNumber: g.phoneNumber ?? "",
        speaksSpanish: g.speaksSpanish ?? false,
        relationship: g.relationship ?? "",
        dateOfBirth: g.dateOfBirth ?? "",
        firstName: g.firstName ?? "",
        lastName: g.lastName ?? "",
      }));
      setGuests(sanitizedGuests);
    }
    if (initialRegistrationId) setRegistrationId(initialRegistrationId);
  }, [initialGuests, initialRegistrationId]);

  const addGuest = () => {
    const newGuest: Guest = {
      //id: crypto.randomUUID()

      //crypto doesn't work on mobile so we need to do math.random
      id: typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 

      : Math.random().toString(36).substring(2, 11),
      

      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      relationship: "",
      speaksSpanish: false,
    };
    setGuests([...guests, newGuest]);
    setErrorMessage(null);
  };

  const removeGuest = (id: string) => {
    setGuests(guests.filter((g) => g.id !== id));
    setErrorMessage(null);
  };

  const updateGuest = (
    id: string,
    field: keyof Guest,
    value: string | boolean
  ) => {
    setGuests(guests.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  // Handle Date Selection from DatePicker
  const handleDateSelect = (guestId: string, date: Date) => {
    // Use UTC methods to prevent timezone offset issues
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD
    updateGuest(guestId, "dateOfBirth", formattedDate);
    setShowDatePicker((prev) => ({ ...prev, [guestId]: false }));
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
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
  };

  const handleSignUp = async () => {
    setErrorMessage(null);

    const errors: Record<string, string> = {};
    guests.forEach((g, index) => {
      if (!g.firstName) errors[`firstName-${index}`] = "Required";
      if (!g.lastName) errors[`lastName-${index}`] = "Required";
      if (g.email && !EMAIL_REGEX.test(g.email)) {
        errors[`email-${index}`] = "Invalid email format";
      }
      if (g.phoneNumber && !/^\d{7,15}$/.test(g.phoneNumber)) {
        errors[`phone-${index}`] = "Enter 7–15 digits";
      }
      if (!g.dateOfBirth) {
        errors[`dob-${index}`] = "Required";
      } else if (g.dateOfBirth > todayYmd) {
        errors[`dob-${index}`] = "Date of birth cannot be in the future";
      }
      if (!g.relationship) errors[`relationship-${index}`] = "Required";
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please fix the errors below.");
      window.scrollTo(0, 0);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      userId: userData?.id,
      positionId: positionData.id,
      comments: comment.trim(),
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

      if (!res.ok) {
        setErrorMessage(responseData.error || "An unexpected error occurred.");
        window.scrollTo(0, 0);
        setIsSubmitting(false);
        return;
      }

      const record = responseData.data;
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
        setIsWaitlisted(true);
        setIsSuccess(false);
        setWaitlistMessage(
          responseData.message ||
            "Your update exceeded capacity, so you have been moved to the waitlist."
        );
      } else {
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

  if (isWaitlisted) {
    return (
      <div className="bg-[#5a718c] p-10 rounded-xl shadow-lg w-full max-w-3xl mx-auto text-center text-white animate-in fade-in zoom-in duration-300">
        <h2 className="text-3xl font-bold mb-2">Waitlist Confirmed</h2>
        <p className="text-blue-100 mb-8 text-lg">{waitlistMessage}</p>
        <div className="bg-white text-left p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-6 mb-8 max-w-2xl mx-auto text-gray-800">
          {eventImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={eventImage}
              alt={eventName}
              className="w-32 h-24 object-cover rounded-sm shrink-0 mx-auto sm:mx-0"
            />
          ) : (
            <div className="w-32 h-24 bg-gray-200 rounded-sm shrink-0 mx-auto sm:mx-0 flex items-center justify-center text-gray-400 font-bold border border-gray-300">
              EVENT
            </div>
          )}
          <div className="space-y-1 text-sm flex-1">
            <p>
              <span className="font-bold text-gray-900">Event:</span>{" "}
              {eventName}
            </p>
            <p>
              <span className="font-bold text-gray-900">Date:</span> {eventDate || "not found"}
            </p>
            <p>
              <span className="font-bold text-gray-900">Time:</span> {eventTime || "not found"}
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
            className="px-6 py-2.5 bg-dark-desaturated-blue text-white rounded font-bold text-sm hover:bg-[#2c3e50] transition shadow-sm"
          >
            Edit details
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-white text-dark-desaturated-blue rounded font-bold text-sm hover:bg-gray-50 transition shadow-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-light-bcp-blue p-10 rounded-xl shadow-lg w-full max-w-3xl mx-auto text-center text-white animate-in fade-in zoom-in duration-300 overflow-hidden">
        <h2 className="text-3xl font-bold mb-2">Registration Confirmed!</h2>
        <p className="text-blue-100 mb-8">
          A confirmation has been sent to your email.
        </p>
        <div className="bg-white text-left p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-6 mb-8 max-w-2xl mx-auto text-gray-800">
          {eventImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={eventImage}
              alt={eventName}
              className="w-32 h-24 object-cover rounded-sm shrink-0 mx-auto sm:mx-0"
            />
          ) : (
            <div className="w-32 h-24 bg-gray-200 rounded-sm shrink-0 mx-auto sm:mx-0 flex items-center justify-center text-gray-400 font-bold border border-gray-300">
              EVENT
            </div>
          )}
          <div className="space-y-1 text-sm flex-1 min-w-0">
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
            <p className="leading">
              <span className="font-bold text-gray-900">Total Group:</span>{" "}
              {1 + guests.length} (You + {guests.length} guests)
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsSuccess(false)}
            className="px-6 py-2.5 bg-[#35566b] text-white rounded font-bold text-sm hover:bg-[#2a4455] transition shadow-sm"
          >
            Edit details
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-white text-light-bcp-blue rounded font-bold text-sm hover:bg-gray-50 transition shadow-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-100 w-full max-w-2xl mx-auto">
      {!userData && (
        // 1. Changed 'absolute' to 'fixed'
        // 2. Removed 'rounded-xl' so it reaches the very corners of the screen
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-400/50 backdrop-blur-[2px]">
          {/* This is your actual modal card. Keep this one rounded! */}
          <div className="bg-white rounded-lg shadow-xl p-10 max-w-md w-full text-center mx-4 border border-gray-200">
            <h2 className="text-3xl font-semibold text-dark-desaturated-blue mb-2">
              Sign in to Volunteer
            </h2>
            <p className="text-gray-900 font-medium mb-8">
              Volunteers must have an account
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.back()}
                className="px-8 py-2.5 bg-gray-300 text-gray-800 rounded font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-2.5 bg-dark-desaturated-blue text-white rounded font-medium hover:bg-[#2c3e50] transition"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-semibold text-bcp-blue">{eventName}</h1>
        <p className="text-lg text-gray-700 mt-2">{positionData?.position}</p>
      </div>
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
      <div className="border border-gray-700 rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <Image
            src={profileImageSrc}
            alt="Profile"
            width={96}
            height={96}
            className="w-24 h-24 rounded-sm object-cover shrink-0"
            unoptimized={
              typeof profileImageSrc === "string" &&
              profileImageSrc.startsWith("http")
            }
          />
          <div className="space-y-1.5 text-sm text-gray-800 pt-1">
            <p>
              <span className="font-semibold text-gray-900">Name:</span>{" "}
              {userData?.firstName || "Guest"} {userData?.lastName || ""}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Email:</span>{" "}
              {userData?.emailAddress || "Not signed in"}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Phone:</span>{" "}
              {userData?.phoneNumber || "N/A"}
            </p>
          </div>
        </div>
      </div>
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Comments
        </label>

        <textarea
          rows={4}
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-light-bcp-blue outline-none resize-none"
        />
        <p className="text-xs text-gray-500 text-right mt-1">{comment.length}/500</p>
      </div>
      <div className="mb-10 text-sm">
        <p className="mb-1">
          You are currently signing up for{" "}
          <span className="font-bold">{positionData?.position}</span>.
        </p>
      </div>
      <div className="space-y-10 mb-10">
        {guests.map((guest, index) => {
          return (
            <div key={guest.id} className="space-y-5">
              {/* Guest Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px bg-gray-700 flex-1"></div>
                <span className="text-sm font-bold text-gray-700">
                  Guest {index + 1}
                </span>
                <div className="h-px bg-gray-700 flex-1"></div>
              </div>

              {/* Full Name */}
              <div className="grid grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-xs text-gray-700 mb-1">
                    First Name
                  </label>

                  <input
                    type="text"
                    maxLength={MAX_NAME}
                    className={`w-full border rounded-md p-2.5 text-sm focus:ring-2 focus:ring-light-bcp-blue outline-none ${
                      fieldErrors[`firstName-${index}`]
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                    value={guest.firstName}
                    onChange={(e) =>
                      updateGuest(guest.id, "firstName", e.target.value)
                    }
                  />
                  {fieldErrors[`firstName-${index}`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors[`firstName-${index}`]}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs text-gray-700 mb-1">
                    Last Name
                  </label>

                  <input
                    type="text"
                    maxLength={MAX_NAME}
                    className={`w-full border rounded-md p-2.5 text-sm focus:ring-2 focus:ring-light-bcp-blue outline-none ${
                      fieldErrors[`lastName-${index}`]
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                    value={guest.lastName}
                    onChange={(e) =>
                      updateGuest(guest.id, "lastName", e.target.value)
                    }
                  />
                  {fieldErrors[`lastName-${index}`] && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldErrors[`lastName-${index}`]}
                    </p>
                  )}
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  className={`w-full border rounded-md p-2.5 text-sm focus:ring-2 focus:ring-light-bcp-blue outline-none ${
                    fieldErrors[`email-${index}`]
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                  value={guest.email}
                  onChange={(e) =>
                    updateGuest(guest.id, "email", e.target.value)
                  }
                />
                {fieldErrors[`email-${index}`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors[`email-${index}`]}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={MAX_PHONE}
                  className={`w-full border rounded-md p-2.5 text-sm focus:ring-2 focus:ring-light-bcp-blue outline-none ${
                    fieldErrors[`phone-${index}`]
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                  value={guest.phoneNumber}
                  onChange={(e) =>
                    updateGuest(
                      guest.id,
                      "phoneNumber",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                />
                {fieldErrors[`phone-${index}`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors[`phone-${index}`]}
                  </p>
                )}
              </div>

              {/* DOB */}
              <div className="relative">
                <label className="block text-xs text-gray-700 mb-2">
                  Participant’s Date of Birth
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setShowDatePicker((prev) => ({
                      ...prev,
                      [guest.id]: !prev[guest.id],
                    }))
                  }
                  className={`w-full border rounded-md p-2.5 text-sm text-left bg-white hover:bg-gray-50 transition-colors ${
                    fieldErrors[`dob-${index}`]
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                >
                  {guest.dateOfBirth
                    ? formatDateForDisplay(guest.dateOfBirth)
                    : "Select date"}
                </button>

                {fieldErrors[`dob-${index}`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors[`dob-${index}`]}
                  </p>
                )}

                {showDatePicker[guest.id] && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() =>
                        setShowDatePicker((prev) => ({
                          ...prev,
                          [guest.id]: false,
                        }))
                      }
                    />
                    {/* DatePicker Dropdown */}
                    <div className="absolute top-full left-0 mt-2 z-50">
                      <DatePicker
                        selectedDate={
                          guest.dateOfBirth
                            ? (() => {
                                const [year, month, day] = guest.dateOfBirth
                                  .split("-")
                                  .map(Number);
                                return new Date(Date.UTC(year, month - 1, day));
                              })()
                            : null
                        }
                        onDateChange={(date) =>
                          handleDateSelect(guest.id, date)
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Spanish */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">
                  Does this person speak Spanish?
                </span>

                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={guest.speaksSpanish === true}
                      onChange={() =>
                        updateGuest(guest.id, "speaksSpanish", true)
                      }
                      className="accent-bcp-blue"
                    />
                    Yes
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={guest.speaksSpanish === false}
                      onChange={() =>
                        updateGuest(guest.id, "speaksSpanish", false)
                      }
                      className="accent-bcp-blue"
                    />
                    No
                  </label>
                </div>
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Relationship to you
                </label>
                <input
                  type="text"
                  maxLength={MAX_RELATIONSHIP}
                  className={`w-full border rounded-md p-2.5 text-sm focus:ring-2 focus:ring-light-bcp-blue outline-none ${
                    fieldErrors[`relationship-${index}`]
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                  value={guest.relationship}
                  onChange={(e) =>
                    updateGuest(guest.id, "relationship", e.target.value)
                  }
                />
                {fieldErrors[`relationship-${index}`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors[`relationship-${index}`]}
                  </p>
                )}
              </div>

              {/* Remove */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => removeGuest(guest.id)}
                  className="text-sm text-gray-700 border border-gray-700 rounded-md px-4 py-1.5 hover:bg-gray-50 transition"
                >
                  Remove guest
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={addGuest}
        className="w-full py-3 mb-8 border border-gray-700 rounded text-gray-800 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
      >
        + Add a Guest
      </button>
      <div className="flex items-center justify-between gap-4">
        {" "}
        <button
          onClick={() => router.back()}
          className="w-full py-3 border border-gray-800 rounded text-gray-900 font-bold text-sm uppercase tracking-wide hover:bg-gray-50 transition-colors"
        >
          {" "}
          Cancel{" "}
        </button>{" "}
        <button
          onClick={handleSignUp}
          disabled={isSubmitting}
          className="w-full py-3 bg-light-bcp-blue text-white rounded font-bold text-sm uppercase tracking-wide hover:bg-[#35566b] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {" "}
          {isSubmitting
            ? registrationId
              ? "Updating..."
              : "Signing up..."
            : registrationId
              ? "Update Registration"
              : "Sign Up"}{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
}
