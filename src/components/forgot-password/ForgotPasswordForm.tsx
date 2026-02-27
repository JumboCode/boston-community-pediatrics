"use client";

import { useState } from "react";
import Button from "../common/buttons/Button";
import arrowLeft from "@/assets/icons/arrow-left.svg";
import Link from "next/link";

export default function ForgotPasswordForm() {
  // set this with backend logic
  const [isError, setIsError] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);

  const handleContinue = async () => {
    // setIsError(setEmail());
    setSentEmail(true);
  };

  return !sentEmail ? (
    <div className="flex flex-col items-center gap-8 border border-medium-gray rounded-lg w-[792px] pt-[50px] px-[48px] pb-[60px] box-border">
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

      {/* Email */}
      <div className="pt-[48px] flex flex-col w-full gap-2.5 px-[54px]">
        <input
          placeholder="Email"
          required
          className={
            isError
              ? "w-full h-[43px] rounded-lg border border-[#E10000] p-3 text-base text-[] placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              : "w-full h-[43px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
          }
        />
        {isError ? (
          <div className="text-base text-[#E10000]">
            There is no account associated with this email
          </div>
        ) : (
          <></>
        )}
      </div>

      {/* Button Placeholder */}
      <Button label="Continue" onClick={handleContinue} />
    </div>
  ) : (
    // After email sent
    <div className="flex flex-col items-center gap-8 border border-medium-gray rounded-lg w-[792px] pt-[50px] px-[102px] pb-[60px] box-border">
      <div className="relative flex items-center w-full justify-center">
        <h1 className="text-bcp-blue text-[36px] font-medium m-0 text-center">
          Password reset email sent!
        </h1>
      </div>

      <div className="text-base text-[24px] text-center">
        Please click on the link in your email to reset your password
      </div>

      {/* Button Placeholder */}
      <Link href="/login">
        <Button label="Back to login" />
      </Link>
    </div>
  );
}
