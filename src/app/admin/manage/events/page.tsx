"use client";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Fragment,
} from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/common/buttons/Button";
import Modal from "@/components/common/Modal";
import Link from "next/link";

interface Signup {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  isGuest: boolean;
}

interface Waitlist {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  isGuest?: boolean;
  positionId?: string;
}

interface EventProps {
  eventId: string;
  eventName: string;
  startDate: Date;
  endDate: Date;
  selected: boolean;
  createdAt?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  positions: {
    positionId: string;
    positionName: string;
    filledSlots: number;
    totalSlots: number;
    waitlistCount: number;
    startTime: string;
    endTime: string;
    date: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    signups: Signup[];
    waitlist: Waitlist[];
  }[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
};

const ManageEventsPage = () => {
  const [event, setEvent] = useState<EventProps[]>([]);
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const router = useRouter();

  // Fetch event information
  const { data: allPositions } = useSWR<any[]>(`/api/eventPosition`, fetcher);
  const { data: allSignups } = useSWR<any[]>(`/api/eventSignup`, fetcher);
  const { data: allWaitlist } = useSWR<any[]>(`/api/waitlist`, fetcher);
  const { data: allVols } = useSWR<any[]>(`/api/events`, fetcher);

  const events = useMemo(() => {
    if (!allVols) return [];
    return allVols.map((v: any) => {
      const positions = (allPositions ?? [])
        .filter((p) => p.eventId === v.id)
        .map((p) => ({
          positionId: p.id,
          positionName: p.position,
          filledSlots: Math.max(
            0,
            (allSignups ?? [])
              .filter((s) => s.positionId === p.id)
              .reduce((sum, s) => sum + 1 + (s.guests?.length ?? 0), 0)
          ),
          totalSlots: p.totalSlots ?? 0,
          startTime: p.startTime,
          endTime: p.endTime,
          date: p.date,
          addressLine1: p.addressLine1 ?? "",
          addressLine2: p.addressLine2 ?? "",
          city: p.city ?? "",
          state: p.state ?? "",
          zipCode: p.zipCode ?? "",
          waitlistCount: (allWaitlist ?? []).filter(
            (w) => w.positionId === p.id
          ).length,
          signups: (allSignups ?? [])
            .filter((s) => s.positionId === p.id)
            .flatMap((s) => {
              if (!s.user) return [];
              const main = {
                firstName: s.user.firstName,
                lastName: s.user.lastName,
                emailAddress: s.user.emailAddress,
                phoneNumber: s.user.phoneNumber,
                isGuest: false,
              };
              const guests = (s.guests ?? []).map((g: any) => ({
                firstName: g.firstName,
                lastName: g.lastName,
                emailAddress: g.emailAddress || "",
                phoneNumber: g.phoneNumber || "",
                isGuest: true,
              }));
              return [main, ...guests];
            }),
          waitlist: (allWaitlist ?? []).filter((w) => w.positionId === p.id),
        }));
      return {
        eventId: v.id,
        eventName: v.name,
        startDate: new Date(v.startTime),
        endDate: new Date(v.endTime),
        addressLine1: v.addressLine1 ?? "",
        addressLine2: v.addressLine2 ?? "",
        city: v.city ?? "",
        state: v.state ?? "",
        zipCode: v.zipCode ?? "",
        selected: false,
        createdAt: v.createdAt,
        positions,
      };
    });
  }, [allVols, allPositions, allSignups, allWaitlist]);

  useEffect(() => {
    setEvent(events);
  }, [events]);

  // Event selection (toggle by `eventId`)
  const toggleSelect = (id?: string) => {
    setEvent((prev) =>
      prev.map((v) => (v.eventId === id ? { ...v, selected: !v.selected } : v))
    );
  };

  // Expanded view
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) newSet.delete(eventId);
      else newSet.add(eventId);
      return newSet;
    });
  };

  // Search Bar and Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const [sortOption, setSortOption] = useState<
    "OLDEST" | "MOST-RECENT" | "PAST" | "UPCOMING" | "NAME_AZ" | "NAME_ZA"
  >("MOST-RECENT");

  const toggleSelectAll = () => {
    const allSelected = event.every((v) => v.selected);
    setEvent((prev) => prev.map((v) => ({ ...v, selected: !allSelected })));
  };

  const sortedEvents = useMemo(() => {
    let list = [...event];

    // Curr Date
    const now = new Date();

    // Apply sorting
    if (sortOption === "UPCOMING") {
      list = list
        .filter((v) => v.startDate > now)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    } else if (sortOption === "PAST") {
      list = list.filter((v) => v.endDate < now);
    } else if (sortOption === "MOST-RECENT") {
      list.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    } else if (sortOption === "OLDEST") {
      list.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    } else if (sortOption === "NAME_AZ") {
      list.sort((a, b) =>
        a.eventName.toLowerCase().localeCompare(b.eventName.toLowerCase())
      );
    } else if (sortOption === "NAME_ZA") {
      list.sort((a, b) =>
        b.eventName.toLowerCase().localeCompare(a.eventName.toLowerCase())
      );
    }

    if (searchQuery) {
      list = list.filter((v) => {
        const full = `${v.eventName}`.toLowerCase();
        return full.includes(searchQuery.toLowerCase());
      });
    }

    return list;
  }, [event, sortOption, searchQuery]);

  useEffect(() => {
    setFilterOpen(false);
  }, [searchQuery]);

  const handleSaveCSV = async () => {
    const selectedEvents = event.filter((v) => v.selected);
    if (selectedEvents.length === 0) return;

    if (selectedEvents.length === 1) {
      const ev = selectedEvents[0];
      const lines = buildCSVLines(ev);
      downloadCSV(lines, `${ev.eventName}.csv`);
    } else {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const ev of selectedEvents) {
        zip.file(`${ev.eventName}.csv`, buildCSVLines(ev).join("\n"));
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadCSV(null, "events.zip", blob);
    }

    setEvent((prev) => prev.map((v) => ({ ...v, selected: false })));
  };

  const buildCSVLines = (ev: EventProps): string[] => {
    const formatTime = (dt: string | Date) =>
      new Date(dt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    const lines: string[] = [];

    lines.push(
      [
        "Event ID",
        "Event Name",
        "First Name",
        "Last Name",
        "Email",
        "Phone Number",
        "Position",
        "Is Guest",
        "Event Start Date",
        "Event End Date",
        "Position Start Time",
        "Position End Time",
        "Position Capacity",
        "Position Waitlist",
        "Address Line 1",
        "Address Line 2",
        "City",
        "State",
        "Zip Code",
      ]
        .map((h) => `"${h}"`)
        .join(",")
    );

    for (const pos of ev.positions) {
      const posStart = pos.startTime ? formatTime(pos.startTime) : "—";
      const posEnd = pos.endTime ? formatTime(pos.endTime) : "—";
      const capacity = `${Math.max(0, pos.filledSlots)} of ${pos.totalSlots}`;
      const address = [
        pos.addressLine1,
        pos.addressLine2 ?? "",
        pos.city,
        pos.state,
        pos.zipCode,
      ];

      for (const v of pos.signups ?? []) {
        const row = [
          ev.eventId,
          ev.eventName,
          v.firstName,
          v.lastName,
          v.emailAddress,
          v.phoneNumber,
          pos.positionName,
          v.isGuest ? "Yes" : "No",
          ev.startDate.toLocaleDateString("en-US"),
          ev.endDate.toLocaleDateString("en-US"),
          posStart,
          posEnd,
          capacity,
          pos.waitlistCount,
          ...address,
        ];
        lines.push(row.map((x) => `"${x ?? ""}"`).join(","));
      }

      // Waitlist rows
      for (const v of pos.waitlist ?? []) {
        const row = [
          ev.eventId,
          ev.eventName,
          v.firstName,
          v.lastName,
          v.emailAddress,
          v.phoneNumber,
          `${pos.positionName} (Waitlist)`,
          v.isGuest ? "Yes" : "No",
          ev.startDate.toLocaleDateString("en-US"),
          ev.endDate.toLocaleDateString("en-US"),
          posStart,
          posEnd,
          capacity,
          pos.waitlistCount,
          ...address,
        ];
        lines.push(row.map((x) => `"${x ?? ""}"`).join(","));
      }
    }

    return lines;
  };

  const downloadCSV = (
    lines: string[] | null,
    filename: string,
    existingBlob?: Blob
  ) => {
    const blob =
      existingBlob ??
      new Blob([lines!.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedCount = event.filter((v) => v.selected).length;

  const closeModal = useCallback(() => {
    setModalTitle(null);
    setModalMessage(null);
    router.refresh();
  }, [router]);

  // Delete Event - show confirmation first
  const handleDeleteConfirm = () => {
    setPendingCount(selectedCount);
    setShowDeleteConfirm(true);
  };

  const handleDeleteApproved = async () => {
    setIsLoading(true);
    const eventToDel: EventProps[] = event.filter((v) => v.selected);

    if (eventToDel.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const deletePromises = eventToDel.map(async (vol) => {
        const res = await fetch(`/api/events?id=${vol.eventId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: vol.eventId }),
        });

        if (!res.ok) {
          throw new Error(`Failed to delete event`);
        }
        return vol.eventId;
      });

      await Promise.all(deletePromises);

      // Remove all selected entries from state
      setEvent((prev) => prev.filter((v) => !v.selected));

      // Show success modal
      setShowDeleteConfirm(false);
      setModalTitle("Event(s) Removed!");
      setModalMessage("Event(s) successfully removed");
    } catch {
      setShowDeleteConfirm(false);
      setModalTitle("Error");
      setModalMessage("Failed to delete event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="items-center justify-center p-6 ml-60 mr-60">
        <h1 className="text-[16px] font-semibold mb-6 text-bcp-blue">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {" / "}
          <Link href="/admin/manage/events" className="hover:underline">
            Manage Events
          </Link>
        </h1>

        {/* Search Bar */}
        <div className="mb-4 flex items-center gap-4 w-full">
          <div
            className="flex flex-1 min-h-[44px] rounded-lg border px-3 py-2 flex-wrap gap-2 cursor-text"
            onClick={() => {
              const input = document.getElementById("event-search-input");
              input?.focus();
            }}
          >
            {/* Selected event chips */}
            {event
              .filter((e) => e.selected)
              .map((e) => (
                <span
                  key={e.eventId}
                  className="flex items-center gap-1 border border-gray-400 
        rounded-full px-3 py-0.5 text-sm bg-white whitespace-nowrap"
                >
                  {e.eventName}
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      toggleSelect(e.eventId);
                    }}
                    className="ml-1 text-gray-500 hover:text-red-500 leading-none"
                  >
                    x
                  </button>
                </span>
              ))}

            {/* Input */}
            <input
              id="event-search-input"
              type="text"
              placeholder={
                event.some((e) => e.selected) ? "" : "Search by event name..."
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setExpandedEvents(new Set());
              }}
              className="flex-1 min-w-[120px] text-sm outline-none"
            />
          </div>

          {/* Filter Dropdown*/}
          <div ref={filterRef} className="relative w-44">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className="h-[44px] w-full rounded-lg border px-4 py-2 text-sm flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="flex-1 text-center">
                {sortOption === "MOST-RECENT"
                  ? "Most Recent"
                  : sortOption === "OLDEST"
                    ? "Oldest"
                    : sortOption === "PAST"
                      ? "Past"
                      : sortOption === "UPCOMING"
                        ? "Upcoming"
                        : sortOption === "NAME_AZ"
                          ? "Name (A–Z)"
                          : "Name (Z–A)"}
              </span>
              <svg
                className={`w-4 h-4 ml-1 flex-shrink-0 transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
                {(
                  [
                    "NAME_AZ",
                    "NAME_ZA",
                    "MOST-RECENT",
                    "OLDEST",
                    "UPCOMING",
                    "PAST",
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortOption(opt);
                      setFilterOpen(false);
                      setExpandedEvents(new Set());
                    }}
                    className={`w-full text-center px-4 py-2 text-sm transition-colors hover:bg-gray-50
                    ${sortOption === opt ? "bg-gray-100 font-medium" : ""}`}
                  >
                    {opt === "NAME_AZ"
                      ? "Name (A–Z)"
                      : opt === "NAME_ZA"
                        ? "Name (Z–A)"
                        : opt === "MOST-RECENT"
                          ? "Most Recent"
                          : opt === "OLDEST"
                            ? "Oldest"
                            : opt === "PAST"
                              ? "Past"
                              : "Upcoming"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Events Table */}
        <div
          ref={tableRef}
          className="bg-white border border-black font-sans max-h-[550px] overflow-y-auto min-w-0"
        >
          <table className="w-full table-fixed border-white-700 text-bcp-blue">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left">
                <th className="py-3 pl-8 px-4 font-normal w-[40%]">Events</th>
                <th className="py-3 px-4 font-normal w-[25%] text-center">
                  Date
                </th>
                <th className="py-3 px-4 font-normal w-[20%] text-center">
                  Capacity
                </th>
                <th className="py-3 px-4    font-normal w-[15%] text-center">
                  <button onClick={toggleSelectAll} className="hover:underline">
                    Select All
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.length === 0 && searchQuery ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No results
                  </td>
                </tr>
              ) : (
                sortedEvents.map((p) => (
                  <Fragment key={p.eventId}>
                    {/* Main Row */}
                    <tr
                      className={`transition-colors duration-200 ${
                        p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                      } border-t border-gray-300`}
                    >
                      <td className="py-3 px-4 pl-8">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => {
                              toggleExpand(p.eventId);
                            }}
                            className="flex-shrink-0"
                          >
                            <svg
                              className={`w-4 h-4 transition-transform ${expandedEvents.has(p.eventId) ? "rotate-90" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                          <Link
                            href={`/event/${p.eventId}`}
                            className="hover:underline truncate"
                          >
                            {p.eventName}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.startDate.toLocaleDateString("en-US") ===
                        p.endDate.toLocaleDateString("en-US")
                          ? p.startDate.toLocaleDateString("en-US")
                          : `${p.startDate.toLocaleDateString("en-US")} - ${p.endDate.toLocaleDateString("en-US")}`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(() => {
                          if (!allPositions)
                            return (
                              <span className="inline-block w-12 h-4 bg-gray-200 rounded animate-pulse" />
                            );
                          const filled = p.positions.reduce(
                            (s, pos) => s + pos.filledSlots,
                            0
                          );
                          const total = p.positions.reduce(
                            (s, pos) => s + pos.totalSlots,
                            0
                          );
                          return `${filled}/${total}`;
                        })()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={p.selected}
                            onChange={() => toggleSelect(p.eventId)}
                            className="w-5 h-5 accent-bcp-blue cursor-pointer"
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Expanded position rows */}
                    {expandedEvents.has(p.eventId) && (
                      <>
                        {!allPositions ? (
                          <tr className="bg-gray-50 border-t border-gray-200">
                            <td
                              colSpan={4}
                              className="py-2 px-4 pl-16 text-sm text-gray-400"
                            >
                              Loading...
                            </td>
                          </tr>
                        ) : p.positions.length === 0 ? (
                          <tr className="bg-gray-50 border-t border-gray-200">
                            <td
                              colSpan={4}
                              className="py-2 px-4 pl-16 text-sm text-gray-400"
                            >
                              No positions
                            </td>
                          </tr>
                        ) : (
                          p.positions.map((pos) => (
                            <tr
                              key={pos.positionId}
                              className="bg-gray-100 hover:bg-gray-200 border-t border-gray-200 transition-colors duration-200"
                            >
                              <td className="py-2 px-4 pl-16 text-sm text-gray-800">
                                {pos.positionName || "—"}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-800 text-center">
                                Capacity: {pos.filledSlots}/{pos.totalSlots}
                              </td>
                              <td className="py-2 px-4 text-sm text-gray-800 text-center">
                                Waitlist: {pos.waitlistCount}
                              </td>
                              <td />
                            </tr>
                          ))
                        )}
                      </>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t w-full">
          <div className="flex justify-between py-6">
            <div className="flex justify-between gap-4">
              <Button
                disabled={selectedCount <= 0}
                label="Save as CSV"
                altStyle="bg-gray-300 text-black px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={handleSaveCSV}
              />
            </div>
            <div className="flex justify-between gap-4">
              <Button
                disabled={selectedCount <= 0}
                label="Remove"
                altStyle="bg-bcp-blue text-white px-5 py-2 rounded-md shadow hover:bg-[#1b323e]"
                onClick={handleDeleteConfirm}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          open={showDeleteConfirm}
          title={`Remove ${pendingCount} event${pendingCount === 1 ? "" : "s"}?`}
          onClose={() => setShowDeleteConfirm(false)}
          buttons={[
            {
              label: "Cancel",
              variant: "secondary",
              onClick: () => setShowDeleteConfirm(false),
              disabled: isLoading,
            },
            {
              label: "Remove",
              variant: "primary",
              onClick: () => handleDeleteApproved(),
              disabled: isLoading,
            },
          ]}
        />
      )}

      {/* Success/Error Modal */}
      {modalMessage && modalTitle && (
        <Modal
          open={true}
          title={modalTitle}
          message={modalMessage}
          onClose={closeModal}
          buttons={[
            {
              label: "Done",
              variant: "primary",
              onClick: closeModal,
            },
          ]}
        />
      )}
    </>
  );
};

export default ManageEventsPage;
