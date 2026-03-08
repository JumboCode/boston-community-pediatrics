"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/common/buttons/Button";
import ManageRolesSkeleton from "@/components/ui/skeleton/ManageRolesSkeleton";
import Modal from "@/components/common/Modal";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface FrontEndUser {
  userId: string;
  signUpId?: string;
  waitlistId?: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  role: string;
  selected: boolean;
  createdAt?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
};

const ManageRolesPage = () => {
  const { user } = useUser();
  const currentUserId = user?.id;
  const [volunteers, setVolunteers] = useState<FrontEndUser[]>([]);

  // search/dropdown helpers copied from admin/email/page.tsx
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [sortOption, setSortOption] = useState<
    | "NAME_AZ"
    | "NAME_ZA"
    | "ADMIN"
    | "VOLUNTEER"
    | "DATE_NEWEST"
    | "DATE_OLDEST"
  >("NAME_AZ");

  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const router = useRouter();

  // Fetch signups for the position (volunteers)
  const { data: allVols, isLoading: isLoadingVols } = useSWR<FrontEndUser[]>(
    `/api/users`,
    fetcher
  );

  const frontEndUsers = useMemo(() => {
    if (!allVols) return [];
    return allVols
      .map((v: FrontEndUser) => ({
        userId: v.userId,
        firstName: v.firstName,
        lastName: v.lastName,
        emailAddress: v.emailAddress,
        phoneNumber: v.phoneNumber,
        role: v.role,
        selected: false,
        createdAt: v.createdAt,
      }))
      .sort((a, b) => {
        const firstNameCompare = a.firstName
          .toLowerCase()
          .localeCompare(b.firstName.toLowerCase());
        if (firstNameCompare !== 0) return firstNameCompare;
        return a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase());
      });
  }, [allVols]);

  useEffect(() => {
    setVolunteers(frontEndUsers);
  }, [frontEndUsers]);

  // Volunteer selection (toggle by `userId`)
  const toggleSelect = (id?: string) => {
    if (!id || id === currentUserId) return;

    setVolunteers((prev) =>
      prev.map((v) => (v.userId === id ? { ...v, selected: !v.selected } : v))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = volunteers
      .filter((v) => v.userId !== currentUserId)
      .every((v) => v.selected);
    setVolunteers((prev) =>
      prev.map((v) =>
        v.userId === currentUserId ? v : { ...v, selected: !allSelected }
      )
    );
  };

  const selectedCount = volunteers.filter((v) => v.selected).length;

  const seenVolunteers = volunteers.filter((v) => {
    const full = `${v.lastName} ${v.firstName} ${v.emailAddress}`.toLowerCase();
    return full.includes(searchQuery.toLowerCase());
  });

  const sortedVolunteers = useMemo(() => {
    let list = [...volunteers];

    // Apply role filters
    if (sortOption === "ADMIN") {
      list = list.filter((v) => v.role === "ADMIN");
    } else if (sortOption === "VOLUNTEER") {
      list = list.filter((v) => v.role === "VOLUNTEER");
    }

    // Apply sorting
    if (sortOption === "NAME_AZ") {
      list.sort((a, b) => {
        const aName = `${a.lastName} ${a.firstName}`.toLowerCase();
        const bName = `${b.lastName} ${b.firstName}`.toLowerCase();
        return aName.localeCompare(bName);
      });
    } else if (sortOption === "NAME_ZA") {
      list.sort((a, b) => {
        const aName = `${a.lastName} ${a.firstName}`.toLowerCase();
        const bName = `${b.lastName} ${b.firstName}`.toLowerCase();
        return bName.localeCompare(aName);
      });
    } else if (sortOption === "DATE_NEWEST") {
      list.sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
      });
    } else if (sortOption === "DATE_OLDEST") {
      list.sort((a, b) => {
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return aDate - bDate;
      });
    }

    return list;
  }, [volunteers, sortOption]);

  function addVolunteer(id: string) {
    toggleSelect(id);
    setSearchQuery("");
    setDropdownOpen(false);
  }

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
  const copyEmailString = volunteers
    .filter((v) => v.selected)
    .map((v) => v.emailAddress)
    .join("\r\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyEmailString);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSaveCSV = () => {
    const header = "Last Name,First Name,Email Address,Phone Number";
    const content = volunteers
      .filter((v) => v.selected)
      .map(
        (v) => `${v.lastName},${v.firstName},${v.emailAddress},${v.phoneNumber}`
      )
      .join("\n");

    // const blob = new Blob([content], { type: "text/plain" });
    const blob = new Blob([`${header}\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const closeModal = useCallback(() => {
    setModalTitle(null);
    setModalMessage(null);
    router.refresh();
  }, [router]);

  const handleMessage = () => {
    const selectedIds = volunteers
      .filter((v) => v.selected)
      .map((v) => v.userId);

    sessionStorage.setItem(
      "adminEmailRecipientUserIds",
      JSON.stringify(selectedIds)
    );
    sessionStorage.setItem("adminEmailSource", "manage");

    router.push("/admin/email");
  };
  if (isLoadingVols) {
    return <ManageRolesSkeleton />;
  }

  // Delete User - show confirmation first
  const handleDeleteConfirm = () => {
    setPendingCount(selectedCount);
    setShowDeleteConfirm(true);
  };

  const handleDeleteApproved = async () => {
    setIsLoading(true);
    const volunteersToDel: FrontEndUser[] = volunteers.filter(
      (v) => v.selected && v.userId !== currentUserId
    );

    if (volunteersToDel.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const deletePromises = volunteersToDel.map(async (vol) => {
        const res = await fetch(`/api/admin/users/${vol.userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: vol.userId }),
        });

        if (!res.ok) {
          throw new Error(`Failed to delete user`);
        }

        return vol.userId;
      });

      await Promise.all(deletePromises);

      // Remove all selected entries from state
      setVolunteers((prev) => prev.filter((v) => !v.selected));

      // Show success modal
      setShowDeleteConfirm(false);
      setModalTitle("Users Removed!");
      setModalMessage("Users successfully removed");
    } catch {
      setShowDeleteConfirm(false);
      setModalTitle("Error");
      setModalMessage("Failed to delete user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit roles - show confirmation first
  const handleEditConfirm = () => {
    setPendingCount(selectedCount);
    setShowEditConfirm(true);
  };

  const handleEditApproved = async () => {
    setIsLoading(true);
    const volunteersToEdit: FrontEndUser[] = volunteers.filter(
      (v) => v.selected && v.userId !== currentUserId
    );

    if (volunteersToEdit.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const editPromises = volunteersToEdit.map(async (vol) => {
        const res = await fetch(`/api/admin/users/${vol.userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: vol.userId,
            role: vol.role === "ADMIN" ? "VOLUNTEER" : "ADMIN",
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to update role`);
        }

        return vol.userId;
      });

      await Promise.all(editPromises);

      setVolunteers((prev) =>
        prev.map((v) => ({
          ...v,
          role: v.selected
            ? v.role === "ADMIN"
              ? "VOLUNTEER"
              : "ADMIN"
            : v.role,
        }))
      );

      // Show success modal
      setShowEditConfirm(false);
      setModalTitle("Roles Updated!");
      setModalMessage("Role successfully assigned!");
    } catch {
      setShowEditConfirm(false);
      setModalTitle("Error");
      setModalMessage("Failed to update roles. Please try again.");
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
          <Link href="/admin/manage" className="hover:underline">
            Manage Roles
          </Link>
        </h1>

        {/* search bar + sort dropdown copied/adapted from admin/email/page.tsx */}
        <div className="mb-4 flex items-center gap-4 w-full">
          <div ref={containerRef} className="relative flex-1">
            <div
              className={`min-h-[44px] w-full rounded-lg border px-3 py-2
                  flex flex-wrap gap-2 cursor-text focus-within:ring-2`}
              onClick={() => setDropdownOpen(true)}
            >
              {volunteers
                .filter((v) => v.selected)
                .map((u) => (
                  <span
                    key={u.userId}
                    className="flex items-center gap-1 border border-gray-400 
                    rounded-full px-3 py-0.5 text-sm text-medium-black bg-white 
                    whitespace-nowrap"
                  >
                    {u.lastName}, {u.firstName}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(u.userId);
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
                      if (e.key === "Enter" && seenVolunteers.length > 0) {
                        addVolunteer(seenVolunteers[0].userId);
                      }
                    }}
                    className="w-full border-none outline-none focus:ring-0 text-sm"
                  />
                </div>
                {seenVolunteers.length === 0 && searchQuery ? (
                  <div className="p-2 text-sm text-gray-500">No results</div>
                ) : (
                  <div className="max-h-[320px] overflow-y-auto">
                    {seenVolunteers.map((u) => (
                      <button
                        key={u.userId}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addVolunteer(u.userId);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-left text-sm"
                      >
                        {u.lastName}, {u.firstName}{" "}
                        <span className="text-gray-500">
                          ({u.emailAddress})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* sort-by dropdown */}
          <div className="w-40">
            <label htmlFor="sort" className="sr-only">
              Sort by role
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) =>
                setSortOption(
                  e.target.value as
                    | "NAME_AZ"
                    | "NAME_ZA"
                    | "ADMIN"
                    | "VOLUNTEER"
                    | "DATE_NEWEST"
                    | "DATE_OLDEST"
                )
              }
              className="h-[44px] w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="NAME_AZ">Name (A–Z)</option>
              <option value="NAME_ZA">Name (Z–A)</option>
              <option value="ADMIN">Admin</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="DATE_NEWEST">Date Created (Newest)</option>
              <option value="DATE_OLDEST">Date Created (Oldest)</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-black font-sans max-h-[550px] overflow-y-auto">
          {/* Volunteer Table (populated by `/api/users`) */}
          <table className="w-full border-white-700 text-bcp-blue">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left">
                <th className="py-3 px-5 font-normal"></th>
                <th className="py-3 pl-5 px-4 font-normal">Name</th>
                <th className="py-3 px-4 font-normal">Role</th>
                <th className="py-3 px-4 font-normal">Email</th>
                <th className="py-3 px-4 pr-5 font-normal">Phone Number</th>
                <th className="py-3 px-4 pl-13 font-normal">
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
              {sortedVolunteers.map((p, i) => {
                const rowNumber = i + 1;

                return (
                  <tr
                    key={p.userId}
                    className={`transition-colors duration-200 ${
                      p.selected ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                    } border-t border-gray-300`}
                  >
                    <td className="py-3 px-6">{rowNumber}</td>
                    <td className="py-3 px-4">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="py-3 px-4">{p.role}</td>
                    <td className="py-3 px-4">{p.emailAddress}</td>
                    <td className="py-3 px-4">{p.phoneNumber}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={p.selected}
                        onChange={() => toggleSelect(p.userId)}
                        disabled={p.userId === currentUserId}
                        className="w-5 h-5 accent-bcp-blue cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t w-full">
          <div className="flex justify-between py-6">
            <div className="flex justify-between gap-4">
              <Button
                disabled={selectedCount <= 0}
                label="Message"
                altStyle="bg-[#f4f4f4] text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={handleMessage}
              />
              <Button
                disabled={selectedCount <= 0}
                label="Copy to Clipboard"
                altStyle="bg-[#f4f4f4] text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={handleCopy}
              />
              <Button
                disabled={selectedCount <= 0}
                label="Save as CSV"
                altStyle="bg-[#f4f4f4] text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={handleSaveCSV}
              />
            </div>
            <div className="flex justify-between gap-4">
              <Button
                disabled={selectedCount <= 0}
                label="Change Role"
                altStyle="bg-[#f4f4f4] text-gray-700 px-5 py-2 rounded-md shadow hover:bg-gray-400"
                onClick={handleEditConfirm}
              />

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

      {/* Edit Confirmation Modal */}
      {showEditConfirm && (
        <Modal
          open={showEditConfirm}
          title="Confirm Role Change"
          message={`Are you sure you want to change roles for ${pendingCount} people?`}
          onClose={() => setShowEditConfirm(false)}
          buttons={[
            {
              label: "Cancel",
              variant: "secondary",
              onClick: () => setShowEditConfirm(false),
              disabled: isLoading,
            },
            {
              label: "Confirm",
              variant: "primary",
              onClick: handleEditApproved,
              disabled: isLoading,
            },
          ]}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          open={showDeleteConfirm}
          title="Confirm Removal"
          message={`remove (${pendingCount}) users?`}
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
              variant: "danger",
              onClick: handleDeleteApproved,
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

export default ManageRolesPage;
