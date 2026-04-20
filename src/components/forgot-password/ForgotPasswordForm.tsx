"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Button from "../common/buttons/Button";
import arrowLeft from "@/assets/icons/arrow-left.svg";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  // 0 = Email entry, 1 = Code and New Password entry
  const [step, setStep] = useState(0);

  // Form states
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error & Loading states
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clearErrors = () => {
    setIsError(false);
    setErrorText("");
  };

  // Step 1: Request the 6-digit code
  const handleRequestCode = async () => {
    if (!isLoaded || !signIn) return;
    clearErrors();
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setStep(1);
    } catch (err: unknown) {
      const clerkError = err as {
        errors?: Array<{ code?: string; message?: string }>;
      };
      const firstError = clerkError.errors?.[0];
      const errorCode = firstError?.code ?? "";

      if (errorCode.includes("identifier") || errorCode.includes("not_found")) {
        setErrorText("There is no account associated with this email");
      } else {
        setErrorText(firstError?.message || "Unable to send reset email");
      }
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify code and set new password
  const handleResetPassword = async () => {
    if (!isLoaded || !signIn) return;
    clearErrors();

    // Front-end validation for matching passwords
    if (password !== confirmPassword) {
      setIsError(true);
      setErrorText("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        // Auto-login the user
        await setActive({ session: result.createdSessionId });
        // Redirect to home
        router.push("/home");
      } else {
        setIsError(true);
        setErrorText("Unable to complete password reset.");
      }
    } catch (err: unknown) {
      const clerkError = err as {
        errors?: Array<{ code?: string; message?: string }>;
      };
      const firstError = clerkError.errors?.[0];

      // Handle specific clerk errors for better UX
      if (firstError?.code === "form_code_incorrect") {
        setErrorText("The 6-digit code is incorrect.");
      } else if (firstError?.code === "form_password_pwned") {
        setErrorText("This password has been compromised. Please choose another.");
      } else {
        setErrorText(firstError?.message || "Unable to reset password.");
      }
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = isError
    ? "w-full h-[43px] rounded-lg border border-[#E10000] p-3 text-base text-black placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
    : "w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-black placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue";

  return (
    <div className="flex flex-col items-center gap-8 border border-medium-gray rounded-lg md:w-[792px] pt-[50px] px-6 md:px-[102px] pb-[60px] box-border">
      {step === 0 && (
        <>
          <div className="flex flex-col items-center w-full gap-6">
            <div className="relative flex items-center w-full justify-center">
              <Link href="/login">
                <Button
                  leftIconPath={arrowLeft}
                  altStyle="absolute left-0"
                  label=""
                />
              </Link>

              <h1 className="text-bcp-blue text-[36px] font-medium m-0 text-center">
                Forgot your password?
              </h1>
            </div>
            <div className="text-[24px]">
              Enter the email associated with your account
            </div>
          </div>

          <div className="pt-[48px] flex flex-col w-full gap-2.5 px-[54px]">
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (isError) clearErrors();
              }}
              required
              className={inputClassName}
            />
            {isError && <div className="text-base text-[#E10000]">{errorText}</div>}
          </div>

          <Button
            label={isLoading ? "Sending..." : "Continue"}
            onClick={handleRequestCode}
            disabled={!email.trim() || !isLoaded || isLoading}
          />
        </>
      )}

      {step === 1 && (
        <>
          <div className="flex flex-col items-center w-full gap-6">
            <div className="relative flex items-center w-full justify-center">
              {/* Removed the nested <button> wrapper here */}
              <Button
                onClick={() => setStep(0)}
                leftIconPath={arrowLeft}
                altStyle="absolute left-0"
                label=""
              />

              <h1 className="text-bcp-blue text-[36px] font-medium m-0 text-center">
                Check your email
              </h1>
            </div>
            <div className="text-[24px] text-center">
              We sent a 6-digit code to <strong>{email}</strong>
            </div>
          </div>

          <div className="pt-[24px] flex flex-col w-full gap-4 px-[54px]">
            <div className="flex flex-col gap-2.5">
              <input
                placeholder="6-Digit Code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (isError) clearErrors();
                }}
                required
                className={inputClassName}
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <input
                placeholder="New Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (isError) clearErrors();
                }}
                required
                className={inputClassName}
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <input
                placeholder="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (isError) clearErrors();
                }}
                required
                className={inputClassName}
              />
            </div>
            {isError && <div className="text-base text-[#E10000]">{errorText}</div>}
          </div>

          <Button
            label={isLoading ? "Resetting..." : "Reset Password"}
            onClick={handleResetPassword}
            disabled={
              !code.trim() ||
              !password.trim() ||
              !confirmPassword.trim() ||
              !isLoaded ||
              isLoading
            }
          />
        </>
      )}
    </div>
  );
}