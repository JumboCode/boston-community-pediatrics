"use client";

import { useState, useEffect, useRef } from "react";
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

  const [to, setTo] = useState("");

  const [users, setUsers] = useState<UserProps[]>([]);

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

  useEffect(() => {
    if (!isAdmin) return;

    async function fetchUsersAndPrefill() {
      try {
        const res = await fetch("/api/users?list=1");
        if (!res.ok) throw new Error("Failed to fetch users list");
        const data = (await res.json()) as UserProps[];
        setUsers(data);

        const raw = sessionStorage.getItem("adminEmailRecipientUserIds");
        if (!raw) return;

        const ids = JSON.parse(raw) as string[];
        if (!Array.isArray(ids) || ids.length === 0) return;

        const emails = data
          .filter((u) => ids.includes(u.id))
          .map((u) => u.emailAddress);

        setTo(emails.join(", "));

        // prevent stale reuse
        sessionStorage.removeItem("adminEmailRecipientUserIds");
        sessionStorage.removeItem("adminEmailSource");
      } catch (err) {
        console.error(err);
      }
    }

    fetchUsersAndPrefill();
  }, [isAdmin]);

  if (isAdmin === null) return null;
  if (!isAdmin) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
      </main>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(to);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    const recipients = to
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (recipients.length === 0) return;

    setSending(true);
    setSuccessModal(null);
    setErrorModal(null);

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          subject: subject.trim(),
          type: "other",
          html: `<div style="white-space: pre-line; font-family: ui-sans-serif, system-ui, -apple-system;">
                  ${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                </div>`,
        }),
      });

      if (!res.ok) throw new Error("Email failed to send");

      setSuccessModal("ok");
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setErrorModal("err");
      setShowModal(true);
    } finally {
      setSending(false);
    }
  };

  const handleScheduleSend = () => {
    // TODO: schedule send
  };

  return (
    <main className="flex items-center justify-center min-h-screen ">
      <form>
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-row items-start justify-between w-[714px]">
            <label className="text-base font-normal text-medium-black mb-1">
              Send to
            </label>
            <input
              name="send-to"
              id="send-to"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-[588px] h-[44px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>
          <div className="flex flex-row items-start justify-between w-[714px]">
            <label className="text-base font-normal text-medium-black mb-1">
              From
            </label>
            <input
              name="from"
              id="from"
              required
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[588px] h-[44px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>
          <div className="flex flex-row items-start justify-between w-[714px]">
            <label className="text-base font-normal text-medium-black mb-1">
              Subject
            </label>
            <input
              name="subject"
              id="subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-[588px] h-[44px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>
          <div className="flex flex-row items-start justify-between w-[714px]">
            <label className="text-base font-normal text-medium-black mb-1">
              Message
            </label>
            <input
              name="message"
              id="message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-[588px] h-[204px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
            />
          </div>
        </div>
        <div className="flex flex-row justify-between pt-[20px] w-[714px]">
          <div className="ml-[126px] mt-6">
            <Button
              label={copied ? "Copied!" : "Copy Email Addresses"}
              altStyle="w-[183px] h-[44px] text-black bg-light-gray rounded-lg font-large flex items-center justify-center"
              onClick={handleCopy}
              type="button"
            />
          </div>

          <div className="flex flex-row gap-4 mt-6">
            <Button
              label="Schedule Send"
              altStyle="w-[150px] h-[44px] text-black bg-light-gray rounded-lg font-large flex items-center justify-center"
              onClick={handleScheduleSend}
              type="button"
            />

            <Button
              label={sending ? "Sending..." : "Send"}
              altStyle="w-[120px] h-[44px] text-white bg-[#4B647C] rounded-lg font-large flex items-center justify-center"
              onClick={handleSend}
              disabled={sending}
              type="button"
            />
          </div>
        </div>{" "}
      </form>

      {/* Success */}
      <Modal
        open={showModal}
        title="Email Successfully Sent!"
        onClose={() => setShowModal(false)}
        buttons={[
          {
            label: "Return",
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
          {
            label: "Return",
            onClick: () => setShowModal(false),
            variant: "danger",
          },
        ]}
      />
    </main>
  );
}
