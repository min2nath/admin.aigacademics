"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AddOrganizerForm from "@/components/forms/AddOrganizerForm";
import { DataTable } from "@/components/DataTable";
import { OrganizerFormValues } from "@/validations/organizerSchema";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner"
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { fetcher } from "@/lib/fetcher";
import EntitySkeleton from "../EntitySkeleton";
import { getIndianFormattedDate } from "@/lib/formatIndianDate"

// tabs
const tabs = ["Active", "Inactive", "All", "Trash"] as const;

export default function OrganizerClient() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Active");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] =
    useState<OrganizerFormValues & { _id?: string } | null>(null);

  // ✅ Fetch organizers with SWR
  const {
    data,
    error,
    isLoading,
    mutate, // call to refresh list after add/edit/delete
  } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/organizers`,
    fetcher
  );

   // ✅ Wrap organizers in useMemo so eslint doesn't complain
      const organizers: (OrganizerFormValues & { _id: string })[] = useMemo(
        () => data?.data ?? [],
        [data]
      ); // <-- change here

  // --- UI state helpers ---
  const handleAdd = () => {
    setEditingOrganizer(null);
    setSheetOpen(true);
  };

  const handleEdit = (organizer: OrganizerFormValues & { _id: string }) => {
    setEditingOrganizer(organizer);
    setSheetOpen(true);
  };

  // --- API actions ---
  const handleSave = async (formData: OrganizerFormValues & { _id?: string }) => {
    try {
      const isEdit = Boolean(formData._id);
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizers/${formData._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizers`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const saved = await res.json();
      if (!res.ok) throw new Error(saved.message || `${isEdit ? "Update" : "Create"} failed`);

      setSheetOpen(false);
      setEditingOrganizer(null);
      mutate(); // refresh list from server
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizers/${id}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Delete failed");

      toast("Organizer has been deleted successfully!", {
            description: getIndianFormattedDate(),
          })
      mutate(); // refresh list
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // --- Table columns ---
  const columns: ColumnDef<OrganizerFormValues & { _id: string }>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "organizerName",
      header: sortableHeader("Organizer Name"),
    },
    {
      accessorKey: "contactPersonName",
      header: sortableHeader("Contact Person Name"),
    },
    {
      accessorKey: "contactPersonEmail",
      header: sortableHeader("Email"),
    },
    { accessorKey: "contactPersonMobile", header: "Mobile" },
    { accessorKey: "status", header: "Status" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-sky-800 hover:bg-sky-900" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. It will permanently delete{" "}
                  <span className="font-semibold">{row.original.organizerName}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(row.original._id)}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  // --- Filtered list based on tab ---
  const filteredOrganizers = useMemo(() => {
    switch (activeTab) {
      case "Active":
        return organizers.filter((o) => o.status === "Active");
      case "Inactive":
        return organizers.filter((o) => o.status === "Inactive");
      case "Trash":
        return organizers.filter((o) => o.status === "Trash");
      case "All":
      default:
        return organizers;
    }
  }, [activeTab, organizers]);

 // UI
   // ✅ Replaced plain "Loading suppliers..." with EntitySkeleton
   if (isLoading) return <EntitySkeleton title="Your Suppliers" />;
  if (error) return <div className="p-4 text-red-600">Failed to load organizers</div>;

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Organizers</h1>
        <Button onClick={handleAdd} className="bg-sky-800 text-white hover:bg-sky-900">
          + Add Organizer
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-4 text-sm text-gray-600 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 transition-colors duration-200 cursor-pointer ${
              tab === activeTab
                ? "border-[#035D8A] text-[#035D8A] font-semibold"
                : "border-transparent dark:hover:text-foreground hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable data={filteredOrganizers} columns={columns} />

      {/* Drawer/Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
          {editingOrganizer ? "Edit Organizer" : "Add Organizer"}
          </h2>
          </div>
          <AddOrganizerForm defaultValues={editingOrganizer || undefined} onSave={handleSave} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// helper to DRY sortable column headers
function sortableHeader(label: string) {
  const HeaderComponent = ({ column }: any) => {
    const sorted = column.getIsSorted();
    return (
      <Button variant="ghost" onClick={() => column.toggleSorting(sorted === "asc")}>
        {label}
        {sorted === "asc" && <ArrowUp className="h-4 w-4 ml-2" />}
        {sorted === "desc" && <ArrowDown className="h-4 w-4 ml-2" />}
        {!sorted && <ArrowUpDown className="h-4 w-4 ml-2" />}
      </Button>
    );
  };

  HeaderComponent.displayName = `SortableHeader(${label})`;

  return HeaderComponent;
}

