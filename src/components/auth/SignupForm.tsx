"use client";

import { useState, useRef } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BackArrow from "@/assets/icons/arrow-left.svg";
import ProfilePlaceholder from "@/assets/icons/pfp-placeholder.svg";
import BasicSkeleton from "../ui/skeleton/BasicSkeleton";
import DatePicker from "@/components/DatePicker";

type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  speaksSpanish: boolean;
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
  profileImageUrl?: string;
};

const SignupForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emptyFields, setEmptyFields] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [savedFormData, setSavedFormData] = useState<SignupFormData | null>(
    null
  );
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  if (!isLoaded) return <BasicSkeleton />;

  const todayYmd = new Date().toISOString().slice(0, 10);

  if (!isLoaded) return <BasicSkeleton />;

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED_TYPES = ["image/jpeg", "image/jpg"];
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
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/onboarding",
      });
    } catch {
      console.error("Google sign up error");
      setError("Failed to initiate Google sign up.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;
    const dob = formData.get("dob") as string;
    const phone = formData.get("phone") as string;
    const street = formData.get("street") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;

    // Validate required fields
    const newEmptyFields = new Set<string>();
    if (!firstName) newEmptyFields.add("firstName");
    if (!lastName) newEmptyFields.add("lastName");
    if (!email) newEmptyFields.add("email");
    if (!phone) newEmptyFields.add("phone");
    if (!dob) newEmptyFields.add("dob");
    if (!password) newEmptyFields.add("password");
    if (!confirmPassword) newEmptyFields.add("confirmPassword");

    if (newEmptyFields.size > 0) {
      setEmptyFields(newEmptyFields);
      return;
    }

    setEmptyFields(new Set());
    setLoading(true);
    setError("");

    // Additional validations
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Phone number must be at least 10 digits.");
      setLoading(false);
      return;
    }
    if (phoneDigits.length > 15) {
      setError("Phone number must be 15 digits or less.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (email.length > 50) {
      setError("Email address must be 50 characters or less.");
      setLoading(false);
      return;
    }

    if (street && street.length > 100) {
      setError("Street address must be 100 characters or less.");
      setLoading(false);
      return;
    }

    if (state && state.length !== 2) {
      setError("State must be exactly 2 characters.");
      setLoading(false);
      return;
    }

    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (zip && !zipRegex.test(zip)) {
      setError(
        "Zip code must be in 5-digit format (12345) or 9-digit format (12345-6789)."
      );
      setLoading(false);
      return;
    }
    const dobValue = formData.get("dob") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Enhanced password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long"
      );
      setLoading(false);
      return;
    }

    if (dobValue && dobValue > todayYmd) {
      setError("Date of birth cannot be in the future");
      setLoading(false);
      return;
    }

    try {
      let uploadedImageUrl = "";

      if (selectedFile) {
        const uploadRes = await fetch("/api/upload-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileType: selectedFile.type }),
        });

        if (!uploadRes.ok) throw new Error("Failed to initialize upload");
        const { uploadUrl, publicUrl } = await uploadRes.json();

        const r2Res = await fetch(uploadUrl, {
          method: "PUT",
          body: selectedFile,
          headers: { "Content-Type": selectedFile.type },
        });

        if (!r2Res.ok) throw new Error("Failed to upload image");
        uploadedImageUrl = normalizeProfileImageUrl(publicUrl) || "";
      }

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setSavedFormData({
        firstName,
        lastName,
        email,
        phone: formData.get("phone") as string,
        dob: formData.get("dob") as string,
        speaksSpanish: formData.get("speaksSpanish") === "true",
        street: formData.get("street") as string,
        apt: formData.get("apt") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zip: formData.get("zip") as string,
        profileImageUrl: uploadedImageUrl,
      });

      setPendingVerification(true);
    } catch (err: unknown) {
      console.error("Signup error:", err);
      const error = err as { errors?: Array<{ message: string }> };
      setError(error?.errors?.[0]?.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        setError("Verification incomplete. Please check your code.");
        setLoading(false);
        return;
      }

      const clerkUserId = completeSignUp.createdUserId;

      await setActive({ session: completeSignUp.createdSessionId });

      if (clerkUserId && savedFormData) {
        const dbResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: {
              id: clerkUserId,
              firstName: savedFormData.firstName,
              lastName: savedFormData.lastName,
              emailAddress: savedFormData.email,
              phoneNumber: savedFormData.phone,
              dateOfBirth: savedFormData.dob,
              speaksSpanish: savedFormData.speaksSpanish,
              streetAddress: savedFormData.street,
              city: savedFormData.city,
              state: savedFormData.state,
              zipCode: savedFormData.zip,
              profileImage: savedFormData.profileImageUrl,
              role: "VOLUNTEER",
              clerkId: clerkUserId,
            },
          }),
        });

        if (!dbResponse.ok) console.error("Failed to sync user to DB");
      }

      router.push("/event");
    } catch {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  function handleDateSelect(date: Date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    setDob(formattedDate);
    setShowDatePicker(false);
  }

  function formatDateForDisplay(dateString: string) {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  if (pendingVerification) {
    return (
      <div className="flex flex-col items-center border border-medium-gray rounded-lg my-12 sm:my-[220px] w-[calc(100%-32px)] sm:w-[600px] mx-auto p-6 sm:p-10 relative">
        <h1 className="text-bcp-blue text-[28px] sm:text-[36px] font-medium mb-6 text-center">
          Verify your Email
        </h1>
        <p className="text-black text-lg sm:text-xl mb-10 text-center">
          We sent a code to{" "}
          <span className="font-bold">{savedFormData?.email}</span>
        </p>

        <form onSubmit={handleVerify} className="flex flex-col gap-6 w-full">
          <div className="flex flex-col items-start">
            <label
              htmlFor="code"
              className="text-base font-normal text-medium-gray mb-1"
            >
              Verification Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              name="code"
              id="code"
              placeholder="123456"
              className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-bcp-blue text-white rounded-lg disabled:opacity-50 hover:bg-text-white transition-colors"
          >
            {loading ? "Verifying..." : "Verify & Create Account"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center border border-medium-gray rounded-lg my-12 sm:my-[220px] w-[calc(100%-32px)] sm:w-[792px] mx-auto relative"
    >
      {/* Back arrow */}
      <div className="w-full flex justify-start mt-7 pl-4 sm:pl-[30px] cursor-pointer">
        <Link href="/login">
          <Image src={BackArrow} alt="Back arrow" className="w-[30.86px] h-6" />
        </Link>
      </div>

      {/* Heading */}
      <h1 className="text-bcp-blue text-[26px] sm:text-[36px] font-medium mt-10 sm:mt-[74px] mb-4 sm:mb-6 text-center leading-tight px-4">
        Welcome to <br /> Boston Community Pediatrics!
      </h1>
      <p className="text-black text-lg sm:text-2xl font-normal text-center mb-10 sm:mb-16 px-4">
        Create an account to start volunteering
      </p>

      {/* Google button */}
      <div className="w-full px-4 sm:px-[102px] mb-8">
        <button
          onClick={handleGoogleSignUp}
          className="w-full h-[44px] flex items-center justify-center gap-3 bg-white border border-medium-gray rounded text-black hover:bg-really-light-gray transition-colors font-medium"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23.52 12.29C23.52 11.43 23.47 10.51 23.3 9.60999H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.94 21.1C22.2 19.01 23.52 15.92 23.52 12.29Z"
              fill="#4285F4"
            />
            <path
              d="M12 24C15.24 24 17.96 22.92 19.94 21.09L16.08 18.09C15.01 18.81 13.63 19.25 12 19.25C8.87 19.25 6.22 17.14 5.28 14.29L1.27 17.4C3.26 21.36 7.37 24 12 24Z"
              fill="#34A853"
            />
            <path
              d="M5.28 14.29C4.78 12.8 4.78 11.2 5.28 9.70999L1.27 6.60999C-0.42 9.96999 -0.42 14.03 1.27 17.39L5.28 14.29Z"
              fill="#FBBC05"
            />
            <path
              d="M12 4.75C13.73 4.72 15.4 5.36 16.66 6.56999L20.04 3.19C17.84 1.12 14.98 -0.03 12 0C7.37 0 3.26 2.64 1.27 6.60999L5.28 9.70999C6.22 6.86 8.87 4.75 12 4.75Z"
              fill="#EA4335"
            />
          </svg>
          Sign up with Google
        </button>
        <div className="w-full flex items-center gap-4 mt-6">
          <div className="h-px bg-medium-gray flex-1" />
          <span className="text-medium-gray text-sm">OR</span>
          <div className="h-px bg-medium-gray flex-1" />
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-8 sm:gap-10 w-full px-4 sm:px-[102px]">
        {/* First / Last */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-[60px]">
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
              maxLength={50}
              className={`w-full h-[43px] rounded-lg border p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 ${
                emptyFields.has("firstName")
                  ? "border-red-500 focus:ring-red-200"
                  : "border-medium-gray focus:border-bcp-blue"
              }`}
            />
            {emptyFields.has("firstName") && (
              <p className="text-red-500 text-sm mt-1">
                Please complete this field
              </p>
            )}
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
              maxLength={50}
              className={`w-full h-[43px] rounded-lg border p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 ${
                emptyFields.has("lastName")
                  ? "border-red-500 focus:ring-red-200"
                  : "border-medium-gray focus:border-bcp-blue"
              }`}
            />
            {emptyFields.has("lastName") && (
              <p className="text-red-500 text-sm mt-1">
                Please complete this field
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="email"
            className="text-base font-normal text-medium-gray mb-1"
          >
            Email
          </label>
          <input
            name="email"
            id="email"
            type="email"
            maxLength={50}
            className={`w-full h-[43px] rounded-lg border p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 ${
              emptyFields.has("email")
                ? "border-red-500 focus:ring-red-200"
                : "border-medium-gray focus:border-bcp-blue"
            }`}
          />
          {emptyFields.has("email") && (
            <p className="text-red-500 text-sm mt-1">
              Please complete this field
            </p>
          )}
        </div>

        {/* Phone */}
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
            inputMode="numeric"
            maxLength={15}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
            className={`w-full h-[43px] rounded-lg border p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 ${
              emptyFields.has("phone")
                ? "border-red-500 focus:ring-red-200"
                : "border-medium-gray focus:border-bcp-blue"
            }`}
          />
          {emptyFields.has("phone") && (
            <p className="text-red-500 text-sm mt-1">
              Please complete this field
            </p>
          )}
        </div>

        {/* DOB */}
        <div className="relative flex flex-col items-start">
          <label
            htmlFor="dob"
            className="text-base font-normal text-medium-gray mb-1"
          >
            Date of Birth
          </label>

          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`w-full h-[43px] rounded-lg border px-3 text-left text-base text-medium-gray bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 ${
              emptyFields.has("dob")
                ? "border-red-500 focus:ring-red-200"
                : "border-medium-gray focus:border-bcp-blue"
            }`}
          >
            {dob ? formatDateForDisplay(dob) : "Select date"}
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

              {/* DatePicker */}
              <div className="absolute top-full left-0 mt-2 z-50">
                <DatePicker
                  selectedDate={
                    dob
                      ? (() => {
                          const [year, month, day] = dob.split("-").map(Number);
                          return new Date(Date.UTC(year, month - 1, day));
                        })()
                      : null
                  }
                  onDateChange={handleDateSelect}
                />
              </div>
            </>
          )}

          {/* Hidden input so FormData still works */}
          <input type="hidden" name="dob" value={dob} />
        </div>

        {/* Languages */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <label
            htmlFor="speakSpanish"
            className="text-base font-normal text-medium-gray"
          >
            Do you speak Spanish?
          </label>
          <div className="flex flex-row items-center gap-8 sm:gap-[48px]">
            <div className="flex flex-row items-center gap-[14px]">
              <input
                type="radio"
                name="speaksSpanish"
                value="true"
                required
                className="accent-bcp-blue rounded-md"
              />
              <label
                htmlFor="speaksSpanish"
                className="text-base font-normal text-medium-gray"
              >
                Yes
              </label>
            </div>
            <div className="flex flex-row items-center gap-[14px]">
              <input
                type="radio"
                className="accent-bcp-blue rounded-md"
                name="speaksSpanish"
                value="false"
              />
              <label
                htmlFor="speaksSpanish"
                className="text-base font-normal text-medium-gray"
              >
                No
              </label>
            </div>
          </div>
        </div>

        {/* Street Address */}
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
            className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
          />
        </div>

        {/* Apt/Suite */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="apt"
            className="text-base font-normal text-medium-gray mb-1"
          >
            Apt, suite, etc (optional)
          </label>
          <input
            name="apt"
            id="apt"
            maxLength={50}
            className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
          />
        </div>

        {/* City */}
        <div className="flex flex-col items-start">
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
            className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
          />
        </div>

        {/* State / Zip */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-[60px]">
          <div className="flex flex-col items-start flex-1">
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
              className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>

          <div className="flex flex-col items-start flex-1">
            <label
              htmlFor="zip"
              className="text-base font-normal text-medium-gray mb-1"
            >
              Zip code (optional)
            </label>
            <input
              name="zip"
              id="zip"
              maxLength={10}
              inputMode="numeric"
              className="w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>
        </div>

        {/* Image Upload UI */}
        <div className="flex items-center gap-[60px]">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg"
            className="hidden"
          />

          {/* Clickable Circle Image */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-[160px] h-[160px] sm:w-[264px] sm:h-[264px] relative cursor-pointer overflow-hidden hover:opacity-90 transition-opacity border border-gray-border flex-shrink-0"
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                width={264}
                height={264}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={ProfilePlaceholder}
                alt="Preview"
                width={264}
                height={264}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <span
            className="text-[20px] text-medium-gray cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload a profile photo <br /> (optional)
          </span>
        </div>

        {/* Password */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="password"
            className="text-base font-normal text-medium-gray mb-1"
          >
            Create password
          </label>
          <p className="text-sm text-medium-gray mb-2">
            Must contain at least one uppercase letter, one lowercase letter,
            one number, and be at least 8 characters long.
          </p>
          <div className="relative w-full">
            <input
              name="password"
              id="password"
              type={showPassword ? "text" : "password"}
              className={`w-full h-[43px] rounded-lg border p-3 pr-10 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 ${
                emptyFields.has("password")
                  ? "border-red-500 focus:ring-red-200"
                  : "border-medium-gray focus:border-bcp-blue"
              }`}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medium-gray hover:text-gray-700"
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>
          {emptyFields.has("password") && (
            <p className="text-red-500 text-sm mt-1">
              Please complete this field
            </p>
          )}
        </div>

        <div className="flex flex-col items-start">
          <label
            htmlFor="confirm-password"
            className="text-base font-normal text-medium-gray mb-1"
          >
            Confirm password
          </label>
          <div className="relative w-full">
            <input
              name="confirm-password"
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full h-[43px] rounded-lg border p-3 pr-10 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 ${
                emptyFields.has("confirmPassword")
                  ? "border-red-500 focus:ring-red-200"
                  : "border-medium-gray focus:border-bcp-blue"
              }`}
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medium-gray hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>
          {emptyFields.has("confirmPassword") && (
            <p className="text-red-500 text-sm mt-1">
              Please complete this field
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4 px-4 text-center">{error}</p>}

      {/* Submit Button */}
      <div className="mt-16 sm:mt-[90px] mb-10 sm:mb-[70px] w-full px-4 sm:px-[102px] flex flex-col items-center gap-4">
        <div id="clerk-captcha" />
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-bcp-blue text-white rounded-lg disabled:opacity-50 hover:bg-text-white transition-colors"
        >
          {loading ? "Please wait..." : "Create Account"}
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
