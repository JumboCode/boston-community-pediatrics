"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs"; // Clerk Hook
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BackArrow from "@/assets/icons/arrow-left.svg";
import ProfilePlaceholder from "@/assets/icons/pfp-placeholder.svg";

type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  languages: string[];
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
};

const SignupForm = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State to switch between Form and Verification
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Store form data here so we can use it AFTER verification
  const [savedFormData, setSavedFormData] = useState<SignupFormData | null>(
    null
  );

  // --- 1. GOOGLE SIGN UP FLOW ---
  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/onboarding", // Goes to onboarding to finish profile
      });
    } catch {
      console.error("Google sign up error");
      setError("Failed to initiate Google sign up.");
    }
  };

  // --- HANDLER 1: SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 1. Create the SignUp on Clerk
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // 2. Send the OTP
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // 3. Save the extra data (phone, dob, addr) to state for later
      setSavedFormData({
        firstName,
        lastName,
        email,
        phone: formData.get("phone") as string,
        dob: formData.get("dob") as string,
        languages: (formData.get("languages") as string)
          .split(",")
          .map((s) => s.trim()),
        street: formData.get("street") as string,
        apt: formData.get("apt") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zip: formData.get("zip") as string,
      });

      // 4. Switch UI to Verification Mode
      setPendingVerification(true);
    } catch {
      setError("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER 2: VERIFY OTP & SYNC DB ---
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);

    try {
      // 1. Verify the code
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
        setError("Verification incomplete. Please check your code.");
        setLoading(false);
        return;
      }

      // 2. Verification Successful - Clerk User Created!
      const clerkUserId = completeSignUp.createdUserId;

      if (clerkUserId) {
        // 3. Sync to YOUR Postgres DB via your existing API
        // We use the clerkUserId as the Primary Key 'id'

        if (!savedFormData) {
          setError("Signup data missing. Please restart signup.");
          return;
        }

        const dbResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: {
              id: clerkUserId, // <--- IMPORTANT: Using Clerk ID as DB ID
              firstName: savedFormData.firstName,
              lastName: savedFormData.lastName,
              emailAddress: savedFormData.email,
              phoneNumber: savedFormData.phone,
              dateOfBirth: savedFormData.dob, // sends string "YYYY-MM-DD"
              languages: savedFormData.languages,
              streetAddress: savedFormData.street, // Map 'street' to 'streetAddress'
              city: savedFormData.city,
              state: savedFormData.state,
              zipCode: savedFormData.zip, // Map 'zip' to 'zipCode'
              role: "VOLUNTEER",
              // clerkId is optional since we used it as PK, but if your schema needs it:
              clerkId: clerkUserId,
            },
          }),
        });

        if (!dbResponse.ok) {
          console.error("Failed to sync user to database");
          // Optional: Handle DB error (maybe retry logic or alert admin)
        }
      }

      // 4. Set active session (Log them in)
      await setActive({ session: completeSignUp.createdSessionId });

      // 5. Redirect
      router.push("/event"); // or wherever you want them to go
    } catch {
      // console.error(JSON.stringify(err, null, 2));
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER: VERIFICATION FORM ---
  if (pendingVerification) {
    return (
      <div className="flex flex-col items-center border border-[#6B6B6B] rounded-lg mt-[220px] mb-[220px] w-[600px] p-10 relative">
        <h1 className="text-[#234254] text-[36px] font-medium mb-6 text-center">
          Verify your Email
        </h1>
        <p className="text-black text-xl mb-10 text-center">
          We sent a code to{" "}
          <span className="font-bold">{savedFormData?.email}</span>
        </p>

        <form
          onSubmit={handleVerify}
          className="flex flex-col gap-6 w-full px-10"
        >
          <div className="flex flex-col items-start">
            <label
              htmlFor="code"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              Verification Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              name="code"
              id="code"
              placeholder="123456"
              className="w-full h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#234254] text-white rounded-lg disabled:opacity-50 hover:bg-[#1a3140] transition-colors"
          >
            {loading ? "Verifying..." : "Verify & Create Account"}
          </button>
        </form>
      </div>
    );
  }

  // --- RENDER: SIGN UP FORM (Original) ---
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center border border-[#6B6B6B] rounded-lg mt-[220px] mb-[220px] w-[792px] relative"
    >
      {/* Back arrow */}
      <div className="w-full flex justify-start mt-7 pl-[30px] cursor-pointer">
        <Link href="/login">
          <Image src={BackArrow} alt="Back arrow" className="w-[30.86px] h-6" />
        </Link>
      </div>

      {/* Heading */}
      <h1 className="text-[#234254] text-[36px] font-medium mt-[74px] mb-6 text-center leading-tight">
        Welcome to <br /> Boston Community Pediatrics!
      </h1>
      <p className="text-black text-2xl font-normal text-center mb-16">
        Create an account to start volunteering
      </p>

      <div className="w-[588px] mb-8">
        <button
          onClick={handleGoogleSignUp}
          className="w-full h-[44px] flex items-center justify-center gap-3 bg-white border border-[#6B6B6B] rounded text-black hover:bg-gray-50 transition-colors font-medium"
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
          <div className="h-px bg-[#6B6B6B] flex-1" />
          <span className="text-[#6B6B6B] text-sm">OR</span>
          <div className="h-px bg-[#6B6B6B] flex-1" />
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-10 mx-[102px]">
        {/* First / Last */}
        <div className="flex flex-row gap-[60px]">
          <div className="flex flex-col items-start">
            <label
              htmlFor="first-name"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              First Name
            </label>
            <input
              name="first-name"
              id="first-name"
              required
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>

          <div className="flex flex-col items-start">
            <label
              htmlFor="last-name"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              Last Name
            </label>
            <input
              name="last-name"
              id="last-name"
              required
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="email"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Email
          </label>
          <input
            name="email"
            id="email"
            type="email"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="phone"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Phone Number
          </label>
          <input
            name="phone"
            id="phone"
            type="tel"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* DOB */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="dob"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Date of Birth
          </label>
          <input
            name="dob"
            id="dob"
            type="date"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Languages */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="languages"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Languages Spoken
          </label>
          <input
            name="languages"
            id="languages"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Street Address */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="street"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Street Address (optional)
          </label>
          <input
            name="street"
            id="street"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Apt/Suite */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="apt"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Apt, suite, etc (optional)
          </label>
          <input
            name="apt"
            id="apt"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* City */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="city"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            City (optional)
          </label>
          <input
            name="city"
            id="city"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* State / Zip */}
        <div className="flex flex-row gap-[60px]">
          <div className="flex flex-col items-start">
            <label
              htmlFor="state"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              State (optional)
            </label>
            <input
              name="state"
              id="state"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>

          <div className="flex flex-col items-start">
            <label
              htmlFor="zip"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              Zip code (optional)
            </label>
            <input
              name="zip"
              id="zip"
              inputMode="numeric"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
        </div>

        {/* Upload helper text */}
        <p className="flex items-center gap-[60px] text-[20px] text-[#6B6B6B]">
          <Image
            src={ProfilePlaceholder}
            alt="Profile placeholder"
            className="w-[264px] h-[264px] left"
          />
          <span>
            Upload a profile photo <br /> (optional)
          </span>
        </p>

        {/* Password */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="password"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Create password
          </label>
          <input
            name="password"
            id="password"
            type="password"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        <div className="flex flex-col items-start">
          <label
            htmlFor="confirm-password"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Confirm password
          </label>
          <input
            name="confirm-password"
            id="confirm-password"
            type="password"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Button */}
      <div className="mt-[90px] mb-[70px]">
        <div id="clerk-captcha" />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[#234254] text-white rounded-lg disabled:opacity-50 hover:bg-[#1a3140] transition-colors"
        >
          {loading ? "Please wait..." : "Create Account"}
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
