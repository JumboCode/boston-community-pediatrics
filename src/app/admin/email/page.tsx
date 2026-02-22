"use client";

import { useState, useEffect, useRef } from "react";
import { sendEmail } from "@/lib/email/resend";
import { NextRequest, NextResponse } from "next/server";
import { useUser } from "@clerk/nextjs";
import Button from "@/components/common/buttons/Button";
import Modal from "@/components/common/Modal";
import AdminNavBar from "@/components/AdminNavBar";
import { getPublicURL } from "@/lib/r2";

interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  // role: string; no idea what this means considering can't see this in the frontend
}


export default function EmailPage() {


  const [showModal, setShowModal] = useState(false);
  const [emailData, setEmailData] = useState({
    to: "", 
    from: "",
    subject: "",
    message: "",
  });

  // Email stuff
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Email success states
  const [sending, setSending] = useState(false);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  
  // Admin check
  const { user, isSignedIn, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    async function fetchUser() {
      try {
        const res = await fetch("/api/users?id=" + user?.id);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setIsAdmin(data?.role == "ADMIN");
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, [user?.id, isLoaded, isSignedIn]);

  if (isAdmin === null) return null;
  if (!isAdmin) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
      </main>
    );
}

  return (

    <main className="flex items-center justify-center min-h-screen ">
      <form>
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-row items-start justify-between w-[714px]">
              <label
                className="text-base font-normal text-medium-black mb-1"
              >
                Send to
              </label>
              <input
                name="first-name"
                id="first-name"
                required
                className="w-[588px] h-[44px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
            <div className="flex flex-row items-start justify-between w-[714px]">
              <label
                className="text-base font-normal text-medium-black mb-1"
              >
                From
              </label>
              <input
                name="first-name"
                id="first-name"
                required
                className="w-[588px] h-[44px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
            <div className="flex flex-row items-start justify-between w-[714px]">
              <label
                className="text-base font-normal text-medium-black mb-1"
              >
                Subject 
              </label>
              <input
                name="first-name"
                id="first-name"
                required
                className="w-[588px] h-[44px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
            <div className="flex flex-row items-start justify-between w-[714px]">
              <label
                className="text-base font-normal text-medium-black mb-1"
              >
                Message
              </label>
              <input
                name="first-name"
                id="first-name"
                required
                className="w-[588px] h-[204px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />

            </div>
          </div>
          <div className = "flex flex-col pl-[126px] pt-[20px]" >

              <Button
                    label="Copy Email Addresses"
                    altStyle="mt-6 w-[183px] h-[44px] text-black bg-light-gray rounded-lg font-large flex items-center justify-center"
              />
          </div>
      </form>

      {/* Success */}
      <Modal
        open={showModal}
        title="Email Successfully Sent!"
        onClose={() => setShowModal(false)}
        buttons={[
          {  label: "Return",
                onClick: () => setShowModal(false),
                variant: "primary",
          },
        ]} 
        />

        {/* Failure */}
      <Modal
        open={showModal}
        title="Email Failed to Send"
        onClose={() => setShowModal(false)}
        buttons={[
          {  label: "Return",
                onClick: () => setShowModal(false),
                variant: "danger",
          },
        ]} 
        /> 
    </main>
  );
}