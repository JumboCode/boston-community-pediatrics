"use client";

import { SignOutButton } from "@clerk/nextjs";

const LogoutForm = () => {
  return (
    <div className="flex flex-col items-center gap-8 border border-medium-gray rounded-lg w-[792px] pt-[50px] px-[102px] pb-[60px] box-border">
      <h1 className="text-bcp-blue text-[36px] font-medium m-0">Logout</h1>

      <SignOutButton redirectUrl="/">
        <button className="w-[174px] h-[44px] bg-bcp-blue text-white rounded hover:bg-text-white transition-colors font-medium">
          Log Out
        </button>
      </SignOutButton>
    </div>
  );
};

export default LogoutForm;
