"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/common/buttons/Button";
import Modal from "@/components/common/Modal";
import { AdminUser } from "@/app/api/eventSignup/controller";
import { WaitlistEntry } from "@/app/api/waitlist/route";

interface FrontEndUser {
  userId: string;
  signUpId?: string;
  waitlistId?: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  speaksSpanish: boolean;
  selected: boolean;
  guestOf?: string;
  isGuest?: boolean;
  comments?: string | null;
  memberSince?: number;
}

interface EventAdminTableProps {
  position: string;
  startTime: string;
  endTime: string;
  description: string;
  totalSlots: number;
  location: string;
  positionId: string;
  isAdmin?: boolean;
}

const EventAdminTable = (props: EventAdminTableProps) => {
  const {
    position,
    startTime,
    endTime,
    description,
    totalSlots,
    location,
    positionId,
    isAdmin = false,
  } = props;

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<{
    userId: string;
    name: string;
    email: string;
    phoneNumber: string;
    speaksSpanish: boolean;
    comment: string;
    memberSince?: number;
    guestName?: string;
    guestEmail?: string;
    guestPhoneNumber?: string;
    guestSpeaksSpanish?: boolean;
  } | null>(null);

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    return res.json();
  };

  // Fetch signups for the position (volunteers)
  const { data: signups } = useSWR<AdminUser[]>(
    positionId ? `/api/eventSignup?positionId=${positionId}` : null,
    fetcher
  );

  // Fetch waitlist ONLY if user is admin
  const { data: waitlistSignups } = useSWR<WaitlistEntry[]>(
    positionId && isAdmin ? `/api/waitlist?positionId=${positionId}` : null,
    fetcher
  );

  const frontEndUsers = useMemo(() => {
    if (!signups) return [];

    return signups.map((s) => ({
      signUpId: s.signupId,
      userId: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      emailAddress: s.emailAddress,
      phoneNumber: s.phoneNumber,
      speaksSpanish: s.speaksSpanish ?? false,
      selected: false,
      guestOf: s.guestOf,
      isGuest: s.isGuest ?? false,
      comments: s.comments,
      memberSince: s.memberSince,
    }));
  }, [signups]);

  // Convert waitlistSignups -> FrontEndUser[]
  const frontEndWaitlistUsers = useMemo(() => {
    if (!waitlistSignups || !Array.isArray(waitlistSignups)) return [];

    return waitlistSignups.map((s) => ({
      userId: s.userId,
      waitlistId: s.waitlistId,
      firstName: s.firstName,
      lastName: s.lastName,
      emailAddress: s.emailAddress,
      phoneNumber: s.phoneNumber,
      speaksSpanish: false,
      selected: false,
      guestOf: s.guestOf,
      isGuest: s.isGuest ?? false,
      comments: s.comments,
    }));
  }, [waitlistSignups]);

  const [volunteers, setVolunteers] = useState<FrontEndUser[]>([]);
  const [waitlist, setWaitlist] = useState<FrontEndUser[]>([]);

  const router = useRouter();

  useEffect(() => {
    setVolunteers(frontEndUsers);
  }, [frontEndUsers]);

  useEffect(() => {
    setWaitlist(frontEndWaitlistUsers);
  }, [frontEndWaitlistUsers]);

  // Handle viewing comment
  const handleViewComment = (signUpId: string) => {
    // Find the main user with this signUpId
    const mainUser = volunteers.find(
      (v) => v.signUpId === signUpId && !v.isGuest
    );
    if (!mainUser || !mainUser.comments) return;

    // Find if there's a guest with this signUpId
    const guest = volunteers.find((v) => v.signUpId === signUpId && v.isGuest);

    setSelectedUserData({
      userId: mainUser.userId,
      name: `${mainUser.firstName} ${mainUser.lastName}`,
      email: mainUser.emailAddress,
      phoneNumber: mainUser.phoneNumber,
      speaksSpanish: mainUser.speaksSpanish,
      comment: mainUser.comments,

      ...(mainUser.memberSince && {
        memberSince: mainUser.memberSince,
      }),

      ...(guest && {
        guestName: `${guest.firstName} ${guest.lastName}`,
        guestEmail: guest.emailAddress,
        guestPhoneNumber: guest.phoneNumber,
        guestSpeaksSpanish: guest.speaksSpanish,
      }),
    });
    setShowCommentModal(true);
  };

  function handleSendMessage(userId: string) {
    sessionStorage.setItem(
      "adminEmailRecipientUserIds",
      JSON.stringify([userId])
    );

    sessionStorage.setItem("adminEmailSource", "event-admin");

    router.push("/admin/email");
  }

  // Volunteer selection - UPDATED to select guests with parent
  const toggleSelect = (id?: string) => {
    if (!id) return;

    setVolunteers((prev) => {
      const clickedItem = prev.find((v) => v.signUpId === id);
      if (!clickedItem) return prev;

      const newSelectedState = !clickedItem.selected;

      return prev.map((v) => {
        if (v.signUpId === id && !v.isGuest) {
          return { ...v, selected: newSelectedState };
        }
        if (v.signUpId === id && v.isGuest && !clickedItem.isGuest) {
          return { ...v, selected: newSelectedState };
        }
        return v;
      });
    });
  };

  const toggleSelectAll = () => {
    const allSelected = volunteers.every((v) => v.selected);
    setVolunteers((prev) =>
      prev.map((v) => ({ ...v, selected: !allSelected }))
    );
  };

  const anySelected = volunteers.some((v) => v.selected);

  // Waitlist selection handlers
  const toggleWaitlistSelect = (id: string) => {
    setWaitlist((prev) => {
      const clickedItem = prev.find((v) => v.waitlistId === id);
      if (!clickedItem) return prev;

      const newSelectedState = !clickedItem.selected;

      return prev.map((v) => {
        if (v.waitlistId === id && !v.isGuest) {
          return { ...v, selected: newSelectedState };
        }
        if (v.waitlistId === id && v.isGuest && !clickedItem.isGuest) {
          return { ...v, selected: newSelectedState };
        }
        return v;
      });
    });
  };

  const toggleWaitlistSelectAll = () => {
    const allSelected = waitlist.every((v) => v.selected);
    setWaitlist((prev) => prev.map((v) => ({ ...v, selected: !allSelected })));
  };

  const anyWaitlistSelected = waitlist.some((v) => v.selected);

  // Remove from event
  const handleDelete = async () => {
    const volunteersToDel: FrontEndUser[] = volunteers.filter(
      (v) => v.selected === true
    );

    if (volunteersToDel.length === 0) return;

    try {
      const uniqueSignupIds = [
        ...new Set(volunteersToDel.map((vol) => vol.signUpId).filter(Boolean)),
      ];

      const deletePromises = uniqueSignupIds.map(async (signUpId) => {
        const res = await fetch(`/api/registrations?id=${signUpId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error(`Failed to remove from event`);
        }

        return signUpId;
      });

      await Promise.all(deletePromises);

      setVolunteers((prev) => prev.filter((v) => !v.selected));

      router.refresh();
    } catch {
      alert(`Error: Failed to remove from event`);
    }
  };

  // Remove from waitlist
  const handleWaitlistDelete = async () => {
    const waitlistToDel: FrontEndUser[] = waitlist.filter((v) => v.selected);

    if (waitlistToDel.length === 0) return;

    try {
      const uniqueWaitlistIds = [
        ...new Set(waitlistToDel.map((vol) => vol.waitlistId).filter(Boolean)),
      ];

      const deletePromises = uniqueWaitlistIds.map(async (waitlistId) => {
        const res = await fetch(`/api/registrations?id=${waitlistId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error(`Failed to delete from waitlist`);
        }

        return waitlistId;
      });

      await Promise.all(deletePromises);

      setWaitlist((prev) => prev.filter((v) => !v.selected));

      router.refresh();
    } catch {
      alert(`Error: Failed to delete from waitlist`);
    }
  };

  // Add to Event
  const handleAddToEvent = async () => {
    const selectedWaitlist = waitlist.filter((w) => w.selected);
    if (selectedWaitlist.length === 0) return;

    const waitlistIds = selectedWaitlist.map((w) => w.waitlistId);

    try {
      const response = await fetch("/api/waitlist/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId, waitlistIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to promote waitlist users");
      }

      setVolunteers((prev) => [
        ...prev,
        ...selectedWaitlist.map((w) => ({
          ...w,
          selected: false,
          waitlistId: undefined,
          signUpId: w.waitlistId,
        })),
      ]);
      setWaitlist((prev) => prev.filter((w) => !w.selected));

      router.refresh();
    } catch (error) {
      console.error("Error promoting waitlist users:", error);
      router.refresh();
    }
  };

  const handleSendVolunteerEmail = () => {
    const selected = volunteers.filter((v) => v.selected && !v.isGuest);
    const userIds = Array.from(new Set(selected.map((v) => v.userId)));

    if (userIds.length === 0) return;

    sessionStorage.setItem(
      "adminEmailRecipientUserIds",
      JSON.stringify(userIds)
    );
    sessionStorage.setItem("adminEmailSource", "volunteers");

    router.push("/admin/email");
  };

  const handleSendWaitlistEmail = () => {
    const selected = waitlist.filter((v) => v.selected && !v.isGuest);
    const userIds = Array.from(new Set(selected.map((v) => v.userId)));

    if (userIds.length === 0) return;

    sessionStorage.setItem(
      "adminEmailRecipientUserIds",
      JSON.stringify(userIds)
    );
    sessionStorage.setItem("adminEmailSource", "waitlist");

    router.push("/admin/email");
  };

  return (
    <div className="min-w-[1100px] flex items-center justify-center p-6">
      <div className="w-full max-w-[996px] bg-white border border-black font-sans">
        {/* Header */}
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row items-start gap-10 mb-3 px-5 pt-5">
            {/* Left Section */}
            <div
              className="text-bcp-blue flex-shrink-0"
              style={{ width: "280px" }}
            >
              <h1 className="text-[24px] font-semibold">{position}</h1>
              <p className="text-[16px] pt-2">
                {location ? location : "No location"}
              </p>
              <p className="text-[16px]">
                {new Date(startTime).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                -{" "}
                {new Date(endTime).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            {/* Right Section */}
            <div className="text-bcp-blue flex-1 flex flex-col justify-between mb-2">
              <p className="text-[16px] leading-[1.6] mb-5">{description}</p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-10 mb-1 px-5">
            <div className="w-[280px] block">
              <p className="text-[24px] w-[280px] block">
                {volunteers.length}/{totalSlots} Spots Filled
              </p>
            </div>
            <div className="bg-gray-200 rounded-full h-4 w-full overflow-hidden">
              <div
                className="bg-light-bcp-blue h-4 rounded-full"
                style={{
                  width: `${totalSlots ? (volunteers.length / totalSlots) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Volunteer Table */}
        <table className="w-full border-white-700 text-bcp-blue">
          <thead className="bg-white sticky top-0 z-10">
            <tr className="text-left">
              <th className="py-3 px-5 font-normal"></th>
              <th className="py-3 px-4 font-normal">Name</th>
              <th className="py-3 px-4 font-normal">Email</th>
              <th className="py-3 px-4 pr-5 font-normal">Phone Number</th>
              <th className="py-3 px-4 font-normal"></th>
              <th className="py-3 px-4 font-normal"></th>
              <th className="py-3 px-4 font-normal">
                <button
                  onClick={toggleSelectAll}
                  className="hover:underline transition-all duration-200 "
                >
                  Select All
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((p, i) => {
              const nextPerson = volunteers[i + 1];
              const hasGuestBelow =
                nextPerson && nextPerson.guestOf && !p.isGuest;
              const rowNumber = i + 1;

              return (
                <tr
                  key={p.signUpId + (p.isGuest ? `-guest-${p.userId}` : "")}
                  className={`transition-colors duration-200 ${
                    p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                  } ${!p.isGuest ? "border-t border-gray-300" : ""} ${
                    !hasGuestBelow && !p.isGuest
                      ? "border-b border-gray-300"
                      : ""
                  } ${p.isGuest && !volunteers[i + 1]?.isGuest ? "border-b border-gray-300" : ""}`}
                >
                  <td className="py-3 px-6">{rowNumber}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {p.isGuest ? (
                        <div className="flex items-start relative">
                          <div className="absolute left-[17.5px] -top-[30px] w-[5px] h-[30px] bg-gray-border"></div>
                          <div className="w-10 h-10 rounded-full flex-shrink-0 relative z-10 bg-gray-border"></div>
                          <div className="ml-3">
                            <div>
                              {p.firstName} {p.lastName}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 relative">
                          <div className="w-10 h-10 rounded-full flex-shrink-0 relative z-10 bg-gray-border"></div>
                          {hasGuestBelow && (
                            <div className="absolute left-[17.5px] top-[40px] w-[5px] h-[30px] bg-gray-border"></div>
                          )}
                          <div>
                            {p.firstName} {p.lastName}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">{p.emailAddress}</td>
                  <td className="py-3 px-4">{p.phoneNumber}</td>
                  <td className="py-3 px-4">
                    {p.speaksSpanish && (
                      <div className="bg-light-bcp-blue text-white w-7 h-7 rounded-lg flex items-center justify-center border border-black">
                        S
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {/* Show "view comment" button only if comments exist, user is not a guest, and comment is not null/empty */}
                    {!p.isGuest && p.comments && p.comments.trim() !== "" && (
                      <button
                        onClick={() => handleViewComment(p.signUpId!)}
                        className="text-gray-500 underline text-sm hover:text-gray-700 transition-colors"
                      >
                        View Comment
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {!p.isGuest && (
                      <input
                        type="checkbox"
                        checked={p.selected}
                        onChange={() => toggleSelect(p.signUpId)}
                        className="w-5 h-5 accent-bcp-blue cursor-pointer"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
            {volunteers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  No one has signed up yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Selection Buttons */}
        {anySelected && (
          <div className="border-t border-gray-200 bg-gray-50 w-full">
            <div className="flex justify-between px-6 py-4">
              <Button
                label="Send Email"
                altStyle="bg-bcp-blue text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
                onClick={handleSendVolunteerEmail}
              />
              <Button
                label="Remove from Event"
                altStyle="bg-gray-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={handleDelete}
              />
            </div>
          </div>
        )}

        {/* WAITLIST SECTION */}
        {isAdmin && (
          <>
            <div className="px-5 pt-10">
              <h1 className="text-[#234254] text-[24px] font-semibold">
                Waitlist: {waitlist.length} Waiting
              </h1>
            </div>

            <table className="w-full border-white-700 text-bcp-blue">
              <thead className="bg-white sticky top-0 z-10">
                <tr className="text-left">
                  <th className="py-3 px-5 font-normal"></th>
                  <th className="py-3 px-4 font-normal">Name</th>
                  <th className="py-3 px-4 font-normal">Email</th>
                  <th className="py-3 px-4 pr-5 font-normal">Phone Number</th>
                  <th className="py-3 px-4 font-normal"></th>
                  <th className="py-3 px-4 font-normal"></th>
                  <th className="py-3 px-4 font-normal">
                    <button
                      onClick={toggleWaitlistSelectAll}
                      className="hover:underline transition-all duration-200 "
                    >
                      Select All
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map((p, i) => {
                  const nextPerson = waitlist[i + 1];
                  const hasGuestBelow =
                    nextPerson && nextPerson.guestOf && !p.isGuest;
                  const rowNumber = i + 1;

                  return (
                    <tr
                      key={
                        p.waitlistId + (p.isGuest ? `-guest-${p.userId}` : "")
                      }
                      className={`transition-colors duration-200 ${
                        p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                      } ${!p.isGuest ? "border-t border-gray-300" : ""} ${
                        !hasGuestBelow && !p.isGuest
                          ? "border-b border-gray-300"
                          : ""
                      } ${p.isGuest && !waitlist[i + 1]?.isGuest ? "border-b border-gray-300" : ""}`}
                    >
                      <td className="py-3 px-6">{rowNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.isGuest ? (
                            <div className="flex items-start relative">
                              <div className="absolute left-[17.5px] -top-[30px] w-[5px] h-[30px] bg-gray-border"></div>
                              <div className="w-10 h-10 rounded-full flex-shrink-0 relative z-10 bg-gray-border"></div>
                              <div className="ml-3">
                                <div>
                                  {p.firstName} {p.lastName}
                                </div>
                                {p.guestOf && (
                                  <div className="text-sm text-gray-500 italic">
                                    Guest of {p.guestOf}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 relative">
                              <div className="w-10 h-10 rounded-full flex-shrink-0 relative z-10 bg-gray-border"></div>
                              {hasGuestBelow && (
                                <div className="absolute left-[17.5px] top-[40px] w-[5px] h-[30px] bg-gray-border"></div>
                              )}
                              <div>
                                {p.firstName} {p.lastName}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{p.emailAddress}</td>
                      <td className="py-3 px-4">{p.phoneNumber}</td>
                      <td className="py-3 px-4">
                        {p.speaksSpanish && (
                          <div className="bg-light-bcp-blue text-white w-7 h-7 rounded-xl flex items-center justify-center border border-black">
                            S
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {/* Waitlist comments if needed */}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!p.isGuest && (
                          <input
                            type="checkbox"
                            checked={p.selected}
                            onChange={() => toggleWaitlistSelect(p.waitlistId!)}
                            className="w-5 h-5 accent-[#234254] cursor-pointer"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
                {waitlist.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No one is on the waitlist.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {anyWaitlistSelected && (
              <div className="border-t border-gray-200 bg-gray-50 w-full">
                <div className="flex justify-between px-6 py-4">
                  <div className="flex gap-3">
                    <Button
                      label="Send Email"
                      altStyle="bg-[#234254] text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
                      onClick={handleSendWaitlistEmail}
                    />
                    <Button
                      label="Add to Event"
                      altStyle="bg-white border border-[#234254] text-[#234254] px-5 py-2 rounded-md shadow hover:bg-gray-50"
                      onClick={handleAddToEvent}
                    />
                  </div>

                  <Button
                    label="Remove from Waitlist"
                    altStyle="bg-gray-300 text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                    onClick={handleWaitlistDelete}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && selectedUserData && (
        <Modal
          open={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          layout="custom"
          description={
            <div className="w-full px-10 py-6 text-left text-bcp-blue">
              {/* USER CARD */}
              <div className="flex items-start gap-6 mb-8">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gray-300 flex-shrink-0" />

                {/* Name + Member */}
                <div className="min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">
                      {selectedUserData.name}
                    </h3>

                    {selectedUserData.speaksSpanish && (
                      <div className="bg-light-bcp-blue text-white w-7 h-7 rounded-lg flex items-center justify-center border border-black text-sm font-bold">
                        S
                      </div>
                    )}
                  </div>

                  {selectedUserData.memberSince && (
                    <p className="text-sm text-gray-500">
                      Member since {selectedUserData.memberSince}
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-x-6 text-sm">
                  <span className="text-gray-600">Phone number</span>
                  <span>{selectedUserData.phoneNumber}</span>

                  <span className="text-gray-600">Email</span>
                  <span>{selectedUserData.email}</span>
                </div>
              </div>

              {/* GUEST SECTION */}
              {selectedUserData.guestName && (
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex-shrink-0" />

                  <div className="min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">
                        {selectedUserData.guestName}
                      </h3>

                      {selectedUserData.guestSpeaksSpanish && (
                        <div className="bg-light-bcp-blue text-white w-7 h-7 rounded-lg flex items-center justify-center border border-black text-sm font-bold">
                          S
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      Guest of {selectedUserData.name.split(" ")[0]}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 text-sm">
                    <span className="text-gray-600">Phone number</span>
                    <span>{selectedUserData.guestPhoneNumber}</span>

                    <span className="text-gray-600">Email</span>
                    <span>{selectedUserData.guestEmail}</span>
                  </div>
                </div>
              )}

              {/* COMMENT */}
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Comment</h4>
                <p className="text-sm leading-relaxed text-gray-700">
                  {selectedUserData.comment}
                </p>
              </div>
            </div>
          }
          buttons={[
            {
              label: "Send message",
              onClick: () => handleSendMessage(selectedUserData!.userId),
              variant: "secondary",
            },
            {
              label: "Go back",
              onClick: () => setShowCommentModal(false),
              variant: "primary",
            },
          ]}
        />
      )}
    </div>
  );
};

export default EventAdminTable;
