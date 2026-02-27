"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Button from "@/components/common/buttons/Button";
import Modal from "@/components/common/Modal";

interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
}

export default function EmailPage() {
  const [showModal, setShowModal] = useState(false);

  // Email stuff
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Handles any errors when trying to send an email
  const [emailError, setEmailError] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clearFormError = (key: string) =>
    setEmailError((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  // We need both all users and any prefilled from EventAdminTable
  const [users, setUsers] = useState<UserProps[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Any emails from EventAdminDetails are called prefilled IDs
  const [prefilledIds, setPrefilledIds] = useState<Set<string>>(new Set());

  // Email success states
  const [sending, setSending] = useState(false);
  const [successModal, setSuccessModal] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Anyone already selected or prefilled is excluded from search
  const selectedUsers = users.filter((u) => selectedIds.has(u.id));

  const copyEmailString = selectedUsers.map((u) => u.emailAddress).join(", ");

  const seenUsers = users.filter((u) => {
    if (selectedIds.has(u.id)) return false; // if already selected don't show

    const full = `${u.lastName} ${u.firstName} ${u.emailAddress}`.toLowerCase();

    return full.includes(searchQuery.toLowerCase());
  });

  function addUser(id: string) {
    setSelectedIds((prev) => new Set(prev).add(id));
    setSearchQuery("");
    searchInputRef.current?.focus();
  }

  // Removes any users and handles if from EventAdminTable
  function removeUser(id: string) {
    setSelectedIds((prev) => {
      const Next = new Set(prev);
      Next.delete(id);
      return Next;
    });

    setPrefilledIds((prev) => {
      const Next = new Set(prev);
      Next.delete(id);
      return Next;
    });
  }

  // Admin check
  const { user, isSignedIn, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    async function fetchUser() {
      try {
        const res = await fetch("/api/users?id=" + user?.id);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setIsAdmin(data?.role === "ADMIN" ? true : false);
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

        // Gets the IDs that came from EventAdminTable
        setSelectedIds(new Set(ids));
        setPrefilledIds(new Set(ids));

        // prevent stale reuse
        sessionStorage.removeItem("adminEmailRecipientUserIds");
        sessionStorage.removeItem("adminEmailSource");
      } catch (err) {
        console.error(err);
      }
    }

    fetchUsersAndPrefill();
  }, [isAdmin]);

  // Dropdown close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [dropdownOpen]);

  if (isAdmin === null) return null;
  if (isAdmin === false) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
      </main>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyEmailString);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    const errs: Record<string, string> = {};
    if (selectedUsers.length === 0)
      errs.to = "Please select at least one recipient";
    if (!subject.trim()) errs.subject = "Subject is required.";
    if (!message.trim()) errs.message = "Message is required.";
    if (Object.keys(errs).length > 0) {
      setEmailError(errs);
      return;
    }
    setEmailError({});

    const recipients = copyEmailString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (recipients.length === 0) return;

    setSending(true);
    setSuccessModal(null);
    setErrorModal(null);
    setErrorMessage(null);

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

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Email API error:", body);
        throw new Error(body?.error ?? `Email failed to send (${res.status})`);
      }

      // Shows pop up on success and erases details
      setSelectedIds(new Set());
      setPrefilledIds(new Set());
      setFrom("");
      setSubject("");
      setMessage("");
      setSuccessModal("ok");
      setShowModal(true);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Email failed to send";
      setErrorMessage(msg);
      setErrorModal("err");
      setShowModal(true);
    } finally {
      setSending(false);
    }
  };

  const handleScheduleSend = () => {
    // TODO: Not our ticket
  };

  return (
    <main className="flex items-center justify-center min-h-screen ">
      <form>
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-row items-center justify-between w-[714px]">
            <label className="text-base font-normal text-medium-black">
              Send to
            </label>
            <div className="flex flex-col w-[588px]">
              <div ref={containerRef} className="relative w-full">
                <div
                  className={`min-h-[44px] w-full rounded-lg border px-3 py-2
                  flex flex-wrap gap-2 cursor-text focus-within:ring-2
                  ${
                    emailError.to
                      ? "border-red-500 focus-within:ring-red-500/30"
                      : "border-medium-gray focus-within:ring-bcp-blue/30 focus-within:border-bcp-blue"
                  }`}
                  onClick={() => setDropdownOpen(true)}
                >
                  {selectedUsers.map((u) => (
                    <span
                      key={u.id}
                      className="flex items-center gap-1 border border-gray-400 
                    rounded-full px-3 py-0.5 text-sm text-medium-black bg-white 
                    whitespace-nowrap"
                    >
                      {u.lastName}, {u.firstName}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUser(u.id);
                        }}
                        className="ml-1 text-gray-500 hover:text-red-500 
                      leading-none"
                        aria-label={`Remove ${u.firstName}`}
                      >
                        x
                      </button>
                    </span>
                  ))}
                  <span className="flex-1 min-w-[4px]" />
                </div>

                {/* Dropdown Search */}
                {dropdownOpen && (
                  <div
                    className="absolute z-50 left-0 right-0 bg-white border 
                border-medium-gray rounded-lg shadow-lg mt-1"
                  >
                    <div className="p-2 border-b border-gray-100">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            setDropdownOpen(false);
                            setSearchQuery("");
                          }
                        }}
                        className="w-full h-[36px] rounded-md border 
                      border-medium-gray px-3 text-sm text-medium-gray 
                      placeholder:text-medium-gray focus:outline-none 
                      focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
                      />
                    </div>

                    {/* Search Results */}
                    <div className="max-h-[200px] overflow-y-auto">
                      {seenUsers.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">
                          {searchQuery
                            ? `No users matching "${searchQuery}"`
                            : "All users selected."}
                        </p>
                      ) : (
                        seenUsers.map((u) => (
                          <button
                            type="button"
                            key={u.id}
                            onClick={() => addUser(u.id)}
                            className="w-full text-left px-4 py-2.5 text-base 
                          text-medium-black hover:bg-gray-50 transition-colors 
                          flex items-center justify-between group"
                          >
                            <span>
                              {u.lastName}, {u.firstName}
                            </span>
                            <span className="text-xs text-gray-400 group-hover:text-gray-500">
                              {u.emailAddress}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* <div className="flex flex-row items-center justify-between w-[714px]">
            <label className="text-base font-normal text-medium-black ">
              From
            </label>
            <input
              name="from"
              id="from"
              required
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[588px] h-[44px] rounded-lg border border-medium-gray
              p-3 text-base text-medium-gray placeholder:text-medium-gray 
              focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 
              focus:border-bcp-blue"
            />
          </div> */}

          <div className="flex flex-row items-center justify-between w-[714px]">
            <label className="text-base font-normal text-medium-black ">
              Subject
            </label>
            <input
              name="subject"
              id="subject"
              required
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                clearFormError("subject");
              }}
              className={`w-[588px] h-[44px] rounded-lg border border-medium-gray
              p-3 text-base text-medium-gray placeholder:text-medium-gray 
              ${
                emailError.subject
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              }`}
            />
          </div>

          <div className="flex flex-row items-start justify-between w-[714px]">
            <label className="text-base font-normal text-medium-black ">
              Message
            </label>
            <textarea
              name="message"
              id="message"
              required
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                clearFormError("message");
              }}
              className={`w-[588px] h-[204px] rounded-lg border 
              border-medium-gray p-3 text-base text-medium-gray 
              placeholder:text-medium-gray 
              ${
                emailError.subject
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue resize-none"
              }`}
            />
          </div>
        </div>
        <div className="flex flex-row justify-between pt-[20px] w-[714px]">
          <div className="ml-[126px] mt-6">
            <Button
              label={"Copy Email Addresses"}
              altStyle="w-[183px] h-[44px] text-black bg-light-gray rounded-lg 
              font-large flex items-center justify-center hover:bg-gray-400"
              onClick={handleCopy}
              type="button"
            />
          </div>

          <div className="flex flex-row gap-4 mt-6">
            <Button
              label="Schedule Send"
              altStyle="w-[150px] h-[44px] text-black bg-light-gray rounded-lg 
              font-large flex items-center justify-center hover:bg-gray-400"
              onClick={handleScheduleSend}
              type="button"
            />

            <Button
              label={sending ? "Sending..." : "Send"}
              altStyle="w-[120px] h-[44px] text-white bg-[#4B647C] rounded-lg 
              font-large flex items-center justify-center hover:bg-light-bcp-blue"
              onClick={handleSend}
              disabled={sending}
              type="button"
            />
          </div>
        </div>{" "}
      </form>
      {/* Success */}
      <Modal
        open={showModal && successModal === "ok"}
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
        open={showModal && errorModal === "err"}
        title="Email Failed to Send"
        description={errorMessage ?? undefined}
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
