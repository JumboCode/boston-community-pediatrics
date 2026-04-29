"use client";

import ProfileEventCard from "@/components/events/ProfileEventCard";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import blankProfile from "@/assets/icons/Group 1.svg";
import Link from "next/link";
import Modal from "@/components/common/Modal";
import ProfilePageSkeleton from "@/components/ui/skeleton/ProfilePageSkeleton";

type MyRegistration = {
  id: string;
  userId: string;
  eventId: string;
  positionId: string;
  hasGuests: boolean;
  date: string | null;
  time: string | null;
  notes: string | null;
  type: "signup" | "waitlist";
  status: "registered" | "waitlisted";
  imageUrl?: string;
  guests: Array<{
    id: string;
    positionId: string;
    firstName: string;
    lastName: string;
    emailAddress: string | null;
    relation: string | null;
    phoneNumber: string | null;
    signupId: string;
    dateOfBirth: string | null;
    comments: string | null;
    speaksSpanish: boolean | null;
  }>;
  position: {
    id: string;
    position: string;
    eventId: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    filledSlots: number;
    totalSlots: number;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    country: string;
    state: string;
    zipCode: string;
    event: {
      id: string;
      name: string;
      description: string;
      date: string[];
      startTime: string;
      endTime: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
      lat: number | null;
      lng: number | null;
      addressLine1: string;
      addressLine2: string | null;
      images: string[];
      pinned: boolean;
      imagesDeleted: boolean;
    };
  };
};

type ModalButton = {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  onClick: () => void;
};

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  const [myEvents, setMyEvents] = useState<MyRegistration[]>([]);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [registrationsLoading, setRegistrationsLoading] = useState(true); const [phoneNumber, setPhoneNumber] = useState<string>("—");
  const [userRole, setUserRole] = useState<string>("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [dbFirstName, setDbFirstName] = useState<string>("");
  const [dbLastName, setDbLastName] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string | undefined>();
  const [modalMessage, setModalMessage] = useState<string | undefined>();
  const [modalButtons, setModalButtons] = useState<ModalButton[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const normalizeProfileImageUrl = (value?: string | null) => {
    if (!value) return value ?? null;
    if (!value.startsWith("http")) return value;
    try {
      const url = new URL(value);
      url.pathname = url.pathname.replace(/\/{2,}/g, "/");
      return url.toString();
    } catch {
      return value;
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/users?id=${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setPhoneNumber(userData.phoneNumber ?? "—");
          setUserRole(userData.role ?? "VOLUNTEER");
          setDbFirstName(userData.firstName ?? "");
          setDbLastName(userData.lastName ?? "");
          if (userData.profileImage) {
            setProfileImageUrl(normalizeProfileImageUrl(userData.profileImage));
          }
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        // Add this finally block!
        setUserDataLoading(false);
      }
    }

    if (isLoaded && isSignedIn) {
      fetchUserData();
    } else if (isLoaded && !isSignedIn) {
      // Also stop loading if they aren't signed in (prevents infinite skeleton on redirect)
      setUserDataLoading(false);
    }
  }, [user?.id, isLoaded, isSignedIn]);

  useEffect(() => {
    async function fetchMyData() {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/registrations?userId=${user.id}`);
        if (response.ok) {
          const rawData: MyRegistration[] = await response.json();

          const enrichedData = await Promise.all(
            rawData.map(async (reg) => {
              const images = reg.position.event.images;
              let resolvedUrl = "/event1.jpg";

              if (images && images.length > 0) {
                try {
                  const filename = images[0];
                  const imgRes = await fetch(`/api/images?filename=${filename}`);
                  if (imgRes.ok) {
                    const imgData = await imgRes.json();
                    if (imgData.url) {
                      resolvedUrl = imgData.url;
                    }
                  }
                } catch {
                  console.error(
                    "Failed to fetch image for event",
                    reg.position.event.id
                  );
                }
              }

              return { ...reg, imageUrl: resolvedUrl };
            })
          );

          setMyEvents(enrichedData);
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setRegistrationsLoading(false);
      }
    }

    if (isLoaded && isSignedIn) {
      fetchMyData();
    }
  }, [user?.id, isLoaded, isSignedIn]);

  const handleRemove = (registrationId: string) => {
    setModalTitle("Remove From Event?");
    setModalMessage(
      "Are you sure you want to remove yourself from this event?"
    );

    setModalButtons([
      {
        label: "Cancel",
        variant: "secondary",
        onClick: () => setModalOpen(false),
      },
      {
        label: "Remove",
        variant: "danger",
        loading: modalLoading,
        onClick: async () => {
          try {
            setModalLoading(true);

            const res = await fetch(`/api/registrations?id=${registrationId}`, {
              method: "DELETE",
            });

            if (res.ok) {
              setMyEvents((prev) =>
                prev.filter((evt) => evt.id !== registrationId)
              );

              setModalTitle("Success");
              setModalMessage("You have been removed from the event.");
              setModalButtons([
                {
                  label: "Close",
                  onClick: () => setModalOpen(false),
                },
              ]);
            } else {
              const err = await res.json();
              setModalTitle("Error");
              setModalMessage(err.error || "Failed to remove registration.");
              setModalButtons([
                {
                  label: "Close",
                  onClick: () => setModalOpen(false),
                },
              ]);
            }
          } catch {
            setModalTitle("Error");
            setModalMessage("An error occurred. Please try again.");
            setModalButtons([
              {
                label: "Close",
                onClick: () => setModalOpen(false),
              },
            ]);
          } finally {
            setModalLoading(false);
          }
        },
      },
    ]);

    setModalOpen(true);
  };

  if (!isLoaded || userDataLoading || registrationsLoading) {
    return <ProfilePageSkeleton />;
  }

  const firstName =
    dbFirstName || (isSignedIn ? (user?.firstName ?? "") : "Guest");
  const lastName = dbLastName || (isSignedIn ? (user?.lastName ?? "") : "");
  const emailAddress = isSignedIn
    ? (user?.primaryEmailAddress?.emailAddress ?? "—")
    : "—";
  const memberSince =
    isSignedIn && user?.createdAt
      ? new Date(user.createdAt).getFullYear()
      : "0000";

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming: MyRegistration[] = [];
  const past: MyRegistration[] = [];

  myEvents.forEach((reg) => {
    if (!reg.position?.event?.date || reg.position.event.date.length === 0) {
      return;
    }
    const eventDate = new Date(reg.position.event.date[0]);
    if (eventDate >= now) {
      upcoming.push(reg);
    } else {
      past.push(reg);
    }
  });

  past.sort((a, b) => {
    const dateA = new Date(a.position.event.date[0]).getTime();
    const dateB = new Date(b.position.event.date[0]).getTime();
    return dateB - dateA;
  });

  const isAdmin = userRole === "ADMIN";

  if (isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="w-[850px] max-w-full rounded-md bg-light-bcp-blue py-16 px-10 shadow-lg flex flex-col items-center">
          <div className="mb-6">
            <Image
              src={profileImageUrl ?? blankProfile}
              alt="Profile"
              width={160}
              height={160}
              className="h-[160px] w-[160px] rounded-full object-cover bg-gray-200"
              unoptimized={!!profileImageUrl}
            />
          </div>

          <div className="text-center text-white mb-10 w-full max-w-[760px]">
            <h1
              title={`${firstName} ${lastName} • Admin`}
              className="text-[32px] font-bold max-w-full truncate whitespace-nowrap"
            >
              {firstName} {lastName} &bull; Admin
            </h1>
            <p className="text-[18px] mt-1">Member since {memberSince}</p>
          </div>

          <div className="w-full max-w-[600px] flex flex-col gap-4 text-white text-[18px] mb-12">
            <div className="flex justify-between items-center">
              <span>Phone number</span>
              <span>{phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Email</span>
              <span className="truncate ml-4">{emailAddress}</span>
            </div>
          </div>

          <div className="flex justify-center gap-6">
            <Link href="/profile/edit">
              <button className="px-8 py-3 rounded-md bg-white text-gray-800 font-medium hover:bg-gray-100 transition-colors">
                Edit Details
              </button>
            </Link>
            <button
              className="px-8 py-3 rounded-md bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors"
              onClick={() => signOut(() => router.push("/"))}
            >
              Log Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="block lg:hidden mb-8 flex justify-center">
          <div className="h-auto w-full max-w-[360px] rounded-2xl bg-light-bcp-blue px-6 py-8">
            <div className="flex justify-center mb-4">
              <Image
                src={profileImageUrl ?? blankProfile}
                alt="Profile"
                width={105}
                height={105}
                className="h-[105px] w-[105px] rounded-full object-cover"
                unoptimized={!!profileImageUrl}
              />
            </div>

            <div className="flex flex-col items-center space-y-[1px] mb-6">
              <div className="text-[24px] font-bold text-white">
                {firstName} {lastName}
              </div>
              <div className="text-[16px] text-white">
                Member since {memberSince}
              </div>
            </div>

            <div className="flex flex-col space-y-2 mb-6">
              <div className="flex justify-between">
                <div className="text-[16px] text-white">Phone number</div>
                <div className="text-[16px] text-white">{phoneNumber}</div>
              </div>

              <div className="flex flex-row justify-between items-center gap-4">
                <div className="text-[16px] text-white">Email</div>
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    title={emailAddress}
                    className="text-[16px] text-white truncate"
                  >
                    {emailAddress}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(emailAddress)}
                    className="text-white/70 hover:text-white transition flex-shrink-0"
                    aria-label="Copy email"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button className="h-[44px] w-[113px] rounded-lg bg-white text-black hover:bg-gray-300">
                <div className="text-[16px]">
                  <Link href="/profile/edit">Edit details</Link>
                </div>
              </button>
              <button
                className="h-[44px] w-[113px] rounded-lg bg-bcp-blue text-white hover:bg-gray-600 cursor-pointer"
                onClick={() => signOut(() => router.push("/"))}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
          <div className="min-w-0">
            <div className="mb-6 pt-6">
              <h1 className="text-[28px] font-bold">Upcoming Events</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 min-h-[300px] content-start">
              {upcoming.length === 0 ? (
                <div className="col-span-full flex items-center justify-center h-[300px]">
                  <p className="text-lg text-gray-500">No upcoming events found.</p>
                </div>
              ) : (
                upcoming.map((reg) => {
                  const event = reg.position.event;
                  const firstDate =
                    event.date && event.date.length > 0
                      ? new Date(event.date[0])
                      : new Date();

                  return (
                    <ProfileEventCard
                      key={reg.id}
                      id={event.id}
                      image={reg.imageUrl || "/event1.jpg"}
                      title={event.name}
                      startTime={new Date(reg.position.startTime)}
                      endTime={new Date(reg.position.endTime)}
                      location={event.addressLine1}
                      date={firstDate}
                      filledSlots={reg.position.filledSlots}
                      totalSlots={reg.position.totalSlots}
                      userRole={userRole}
                      onEdit={() => router.push(`/register/${reg.positionId}`)}
                      onRemove={() => handleRemove(reg.id)}
                      onVolunteer={() => router.push(`/event/${event.id}`)}
                      positionName={reg.position.position}
                    />
                  );
                })
              )}
            </div>

            <div className="mt-12 mb-20">
              <h2 className="text-[28px] font-bold mb-6">Your Past Events</h2>

              <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-[60px_1fr_1fr_60px] md:grid-cols-[80px_1.5fr_1.5fr_80px] border-b border-gray-200 bg-white py-4 px-4">
                  <div></div>
                  <div className="text-left text-[14px] font-medium text-gray-900">
                    Event
                  </div>
                  <div className="text-left text-[14px] font-medium text-gray-900">
                    Position
                  </div>
                  <div className="text-center text-[14px] font-medium text-gray-900">
                    Hours
                  </div>
                </div>

                <div className="min-h-[320px] max-h-[320px] overflow-y-auto">
                  {past.length === 0 ? (
                    <div className="flex items-center justify-center h-[320px] text-gray-500">
                      No past events found.
                    </div>
                  ) : (
                    past.map((reg) => {
                      const dateObj = new Date(reg.position.event.date[0]);
                      const month = dateObj
                        .toLocaleString("default", { month: "short" })
                        .toUpperCase();
                      const day = dateObj.getDate().toString().padStart(2, "0");
                      const start = new Date(
                        reg.position.event.startTime
                      ).getTime();
                      const end = new Date(reg.position.endTime).getTime();
                      const hoursVal = !isNaN(end - start)
                        ? (end - start) / (1000 * 60 * 60)
                        : 0;
                      const hoursDisplay =
                        hoursVal % 1 === 0
                          ? hoursVal.toString()
                          : hoursVal.toFixed(1);

                      return (
                        <Link href={`/event/${reg.position.event.id}`} key={reg.id}>
                          <div className="grid grid-cols-[60px_1fr_1fr_60px] md:grid-cols-[80px_1.5fr_1.5fr_80px] items-center border-b border-gray-100 py-4 px-4 last:border-0 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col items-center justify-center leading-none">
                              <span className="text-[11px] font-bold uppercase text-gray-500">
                                {month}
                              </span>
                              <span className="text-[22px] font-bold text-black">
                                {day}
                              </span>
                            </div>
                            <div className="text-[14px] md:text-[16px] font-medium text-black truncate pr-2">
                              {reg.position.event.name}
                            </div>
                            <div className="text-[12px] md:text-[14px] text-gray-600 truncate pr-2">
                              {reg.position.position}
                            </div>
                            <div className="text-[14px] font-medium text-black text-center">
                              {hoursDisplay}
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>



          <div className="hidden lg:block pt-6">
            <div className="w-full rounded-2xl bg-light-bcp-blue px-6 py-8">
              <div className="flex justify-center mb-4">
                <Image
                  src={profileImageUrl ?? blankProfile}
                  alt="Profile"
                  width={105}
                  height={105}
                  className="h-[105px] w-[105px] rounded-full object-cover"
                  unoptimized={!!profileImageUrl}
                />
              </div>

              <div className="flex flex-col items-center space-y-[1px] mb-6">
                <div className="text-[24px] font-bold text-white text-center">
                  {firstName} {lastName}
                </div>
                <div className="text-[16px] text-white">
                  Member since {memberSince}
                </div>
              </div>

              <div className="flex flex-col space-y-2 mb-6">
                <div className="flex justify-between gap-4">
                  <div className="text-[16px] text-white">Phone number</div>
                  <div className="text-[16px] text-white text-right">
                    {phoneNumber}
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <div className="text-[16px] text-white">Email</div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      title={emailAddress}
                      className="text-[16px] text-white truncate text-right"
                    >
                      {emailAddress}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(emailAddress)}
                      className="text-white/70 hover:text-white transition flex-shrink-0"
                      aria-label="Copy email"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button className="h-[44px] w-[113px] rounded-lg bg-white text-black hover:bg-gray-300">
                  <div className="text-[16px]">
                    <Link href="/profile/edit">Edit details</Link>
                  </div>
                </button>
                <button
                  className="h-[44px] w-[113px] rounded-lg bg-bcp-blue text-white hover:bg-gray-600 cursor-pointer"
                  onClick={() => signOut(() => router.push("/"))}
                >
                  Log Out
                </button>

              </div>
            </div>
          </div>
        </div>

        <Modal
          open={modalOpen}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
          buttons={modalButtons}
        />
      </div>


    </main>
  );
}