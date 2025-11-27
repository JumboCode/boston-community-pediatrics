"use client";

import { useState } from "react";
import { useStackApp } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginForm = () => {
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

    try {
      // 1. Attempt Sign In
      const result = await app.signInWithCredential({
        email,
        password,
      });

      // 2. Handle API Errors
      if (result.status === "error") {
        throw new Error(result.error.message);
      }

      // 3. Redirect on Success
      router.push("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.message || "Failed to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-8 border border-[#6B6B6B] rounded-lg w-[792px] pt-[50px] px-[102px] pb-[60px] box-border"
    >
      <h1 className="text-[#234254] text-[36px] font-medium m-0">Sign In</h1>

      {/* Error Display */}
      {error && (
        <div className="w-full text-red-500 text-center bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Email */}
      <input
        name="email" 
        type="email"
        placeholder="Email"
        required
        className="w-full h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
      />

      {/* Password */}
      <input
        name="password"
        placeholder="Password"
        required
        type="password"
        className="w-full h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-[174px] h-[44px] bg-[#234254] text-white rounded hover:bg-[#1a3140] transition-colors disabled:opacity-50 font-medium"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

      {/* Footer Links */}
      <div className="flex flex-row items-center gap-4">
        <Link
          href="/signup"
          className="text-base text-black no-underline hover:underline"
        >
          Create an account
        </Link>
        <div className="w-px h-[22px] bg-black" />
        <Link
          href="/forgot-password"
          className="text-base text-black no-underline hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;