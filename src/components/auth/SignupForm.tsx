"use client";

import { useState } from "react";
import { useStackApp } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BackArrow from "@/assets/icons/arrow-left.svg";
import ProfilePlaceholder from "@/assets/icons/pfp-placeholder.svg";

const SignupForm = () => {
  const app = useStackApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      // 1. Sign up
      const result = await app.signUpWithCredential({
        email,
        password,
      });

      // 2. Check for error in the result object
      if (result.status === "error") {
        throw new Error(result.error.message);
      }

      // 3. Fetch the newly signed-in user
      const user = await app.getUser();

      // 4. Update the user profile
      if (user) {
        await user.update({
          displayName: `${firstName} ${lastName}`,
          clientMetadata: {
            phone: formData.get("phone") as string,
            dob: formData.get("dob") as string,
            languages: formData.get("languages") as string,
            address: {
              street: formData.get("street") as string,
              apt: formData.get("apt") as string,
              city: formData.get("city") as string,
              state: formData.get("state") as string,
              zip: formData.get("zip") as string,
            },
          },
        });

        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center border border-[#6B6B6B] rounded-lg mt-[220px] mb-[220px] w-[792px] relative"
    >
      {/* Back arrow */}
      <div className="w-full flex justify-start mt-7 pl-[30px] cursor-pointer">
        <Link href="/">
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
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[#234254] text-white rounded-lg disabled:opacity-50 hover:bg-[#1a3140] transition-colors"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
