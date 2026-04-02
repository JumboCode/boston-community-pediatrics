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

interface EventProps {
  eventId: string;
  eventName: string;
  startDate: Date;
  endDate: Date;
  selected: boolean;
  createdAt?: string;
  positions: {
    positionId: string;
    positionName: string;
    filledSlots: number;
    totalSlots: number;
    waitlistCount: number;
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
  const { data: allPositions } = useSWR<PositionData[]>(`/api/eventPosition`, fetcher);

  const { data: allVols } = useSWR<any[]>(`/api/events`, fetcher);
  const { data: allPositions } = useSWR<any[]>(`/api/eventPosition`, fetcher);
  const { data: allSignups } = useSWR<any[]>(`/api/eventSignup`, fetcher);
  const { data: allWaitlist } = useSWR<any[]>(`/api/waitlist`, fetcher);
  useEffect(() => {
  console.log("positions:", allPositions);
  console.log("signups:", allSignups);
  console.log("waitlist:", allWaitlist);
}, [allPositions, allSignups, allWaitlist]);

  const events = useMemo(() => {
    if (!allVols) return [];
    return allVols.map((v: any) => {
      const positions = (allPositions ?? [])
        .filter((p) => p.eventId === v.id)
        .map((p) => ({
          positionId: p.id,
          positionName: p.name,
          filledSlots: (allSignups ?? []).filter((s) => s.positionId === p.id)
            .length,
          totalSlots: p.totalSlots ?? 0,
          waitlistCount: (allWaitlist ?? []).filter(
            (w) => w.positionId === p.id
          ).length,
        }));

      return {
        eventId: v.id,
        eventName: v.name,
        startDate: new Date(v.startTime),
        endDate: new Date(v.endTime),
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

  // Search Bar and Sort, no dropdown
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [sortOption, setSortOption] = useState<
    "OLDEST" | "MOST-RECENT" | "PAST" | "UPCOMING"
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
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()); // soonest event displayed first
    } else if (sortOption === "PAST") {
      list = list.filter((v) => v.endDate < now);
    } else if (sortOption === "MOST-RECENT") {
      list.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    } else if (sortOption === "OLDEST") {
      list.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }

    if (searchQuery) {
      list = list.filter((v) => {
        const full = `${v.eventName}`.toLowerCase(); // whenever we figure out how the positions look like we can add that here too
        return full.includes(searchQuery.toLowerCase());
      });
    }

    return list;
  }, [event, sortOption, searchQuery]);

  const handleSaveCSV = () => {
    const header =
      "Event Name,Start Date,End Date,Volunteer Role,Volunteer Name";
    const selectedEvents = event.filter((v) => v.selected);

    const rows: string[] = [];

    selectedEvents.forEach((ev) => {
      // Find all positions for this event
      const positions =
        allPositions?.filter((pos) => pos.eventId === ev.eventId) || [];

      positions.forEach((pos) => {
        // Find all volunteers signed up for this position
        const volunteers =
          allSignups?.filter((s) => s.positionId === pos.id) || [];

        volunteers.forEach((vol) => {
          const volunteerName = `${vol.firstName} ${vol.lastName}`;
          const row = [
            ev.eventName,
            ev.startDate.toLocaleDateString("en-US"),
            ev.endDate.toLocaleDateString("en-US"),
            pos.name,
            volunteerName,
          ]
            .map((value) => `"${value}"`)
            .join(",");
          rows.push(row);
        });
      });
    });

    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download =
      selectedEvents.length === 1
        ? `${selectedEvents[0].eventName}.csv`
        : "events.csv";
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
          <div className="flex flex-1 h-[44px] rounded-lg border overflow-hidden">
            <input
              type="text"
              placeholder="Search by event name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm outline-none"
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
                      : "Upcoming"}
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
                {(["MOST-RECENT", "OLDEST", "UPCOMING", "PAST"] as const).map(
                  (opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortOption(opt);
                        setFilterOpen(false);
                      }}
                      className={`w-full text-center px-4 py-2 text-sm transition-colors hover:bg-gray-50
                    ${sortOption === opt ? "bg-gray-100 font-medium" : ""}`}
                    >
                      {opt === "MOST-RECENT"
                        ? "Most Recent"
                        : opt === "OLDEST"
                          ? "Oldest"
                          : opt === "PAST"
                            ? "Past"
                            : "Upcoming"}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white border border-black font-sans max-h-[550px] overflow-y-auto">
          <table className="w-full table-fixed border-white-700 text-bcp-blue">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left">
                <th className="py-3 pl-8 px-4 font-normal w-[40%]">Events</th>
                <th className="py-3 px-4 font-normal w-[25%]">Date</th>
                <th className="py-3 px-4 font-normal w-[20%]">Capacity</th>
                <th className="py-3 px-4 pl-13 font-normal w-[15%]">
                  <button onClick={toggleSelectAll} className="hover:underline">
                    Select All
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((p) => (
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
                          onClick={() => toggleExpand(p.eventId)}
                          className="flex-shrink-0 text-sm transition-transform"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              expandedEvents.has(p.eventId) ? "rotate-90" : ""
                            }`}
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
                    <td className="py-3 px-4">
                      {p.startDate.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{p.positions.length}</td>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={p.selected}
                        onChange={() => toggleSelect(p.eventId)}
                      />
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedEvents.has(p.eventId) && (
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-12 py-3 w-full">
                        <div className="w-full max-w-full">
                          {p.positions.map((pos) => (
                            <div
                              key={pos.positionId}
                              className="flex justify-between text-sm border rounded px-3 py-2 bg-white"
                            >
                              <span>{pos.positionName}</span>
                              <span>
                                {pos.filledSlots}/{pos.totalSlots} • WL:{" "}
                                {pos.waitlistCount}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
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
          // message={`Remove ${pendingCount} event${pendingCount === 1 ? "" : "s"}?`}
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
