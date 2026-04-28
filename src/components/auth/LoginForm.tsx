"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BasicSkeleton from "../ui/skeleton/BasicSkeleton";

const LoginForm = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emptyFields, setEmptyFields] = useState<Set<string>>(new Set());
  if(!isLoaded) return <BasicSkeleton/>;

  // --- 1. EMAIL/PASSWORD LOGIN ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate fields
    const newEmptyFields = new Set<string>();
    if (!email) newEmptyFields.add("email");
    if (!password) newEmptyFields.add("password");

    if (newEmptyFields.size > 0) {
      setEmptyFields(newEmptyFields);
      return;
    }

    setEmptyFields(new Set());
    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/event");
      } else {
        console.error(JSON.stringify(result, null, 2));
        setError("Login incomplete. Please check your credentials.");
      }
    } catch {
      console.error("Login error");
      setError("Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. GOOGLE LOGIN ---
  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    try {
      // Redirects to /dashboard after success (Skipping onboarding)
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/event",
      });
    } catch {
      console.error("Google sign in error");
      setError("Failed to initiate Google sign in.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 border border-medium-gray rounded-lg w-full md:w-[792px] pt-[50px] px-6 md:px-[102px] pb-[60px] box-border">      <h1 className="text-bcp-blue text-[36px] font-medium m-0">Sign In</h1>

      {/* Error Display */}
      {error && (
        <div className="w-full text-red-500 text-center bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* --- GOOGLE SIGN IN BUTTON --- */}
      <button
        onClick={handleGoogleSignIn}
        className="w-full h-[44px] flex items-center justify-center gap-3 bg-white border border-medium-gray rounded text-black hover:bg-gray-50 transition-colors font-medium"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
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

        Sign in with Google
      </button>

      <div className="w-full flex items-center gap-4">
        <div className="h-px bg-medium-gray flex-1" />
        <span className="text-medium-gray text-sm">OR</span>
        <div className="h-px bg-medium-gray flex-1" />
      </div>

      {/* --- EMAIL FORM --- */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-8"
      >
        <div className="w-full">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={`w-full h-[43px] rounded-lg border p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 ${
              emptyFields.has("email")
                ? "border-red-500 focus:ring-red-200"
                : "border-medium-gray focus:border-bcp-blue"
            }`}
          />
          {emptyFields.has("email") && (
            <p className="text-red-500 text-sm mt-1">Please complete this field</p>
          )}
        </div>

        <div className="relative w-full">
          <input
            name="password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            className={`w-full h-[43px] rounded-lg border p-3 pr-10 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 ${
              emptyFields.has("password")
                ? "border-red-500 focus:ring-red-200"
                : "border-medium-gray focus:border-bcp-blue"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medium-gray hover:text-gray-700"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
          {emptyFields.has("password") && (
            <p className="text-red-500 text-sm mt-1">Please complete this field</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-[174px] h-[44px] bg-bcp-blue text-white rounded hover:bg-text-white transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

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
    </div>
  );
};

export default LoginForm;
