"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "@/components/ui/alert-dialog"
import AddPaymentGateway from "@/components/forms/AddPaymentGatewayForm"
import { DataTable } from "@/components/DataTable"
import { TeamFormValues } from "@/validations/teamSchema"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import { fetcher } from "@/lib/fetcher";
import { apiRequest } from "@/lib/apiHelper";
import EntitySkeleton from "../EntitySkeleton"
import { getIndianFormattedDate } from "@/lib/formatIndianDate"

const tabs = ["Active", "Inactive", "All", "Trash"] as const;
type Tab = typeof tabs[number];

export default function TeamClient() {
  const [activeTab, setActiveTab] = useState<Tab>("Active");
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<TeamFormValues & { _id?: string } | null>(null)

  
  // 🔑 Fetch all suppliers with SWR
  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams`,
    fetcher
  );

   //Wrap teams in useMemo
    const teams: (TeamFormValues & { _id: string })[] = useMemo(
      () => data?.data ?? [],
      [data]
    );
  

  //Open sheet for Add mode
  const handleAdd = () => {
    setEditingTeam(null)
    setSheetOpen(true)
  }

  //Open sheet for Edit mode
  const handleEdit = (team: TeamFormValues & { _id: string }) => {
    setEditingTeam(team)
    setSheetOpen(true)
  }

  //Save callback (create/update)
  const handleSave = async (formData: TeamFormValues & { _id?: string }) => {
   try {
      if (formData._id) {
        await apiRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams/${formData._id}`,
          "PUT",
          formData
        );
      } else {
        await apiRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams`,
          "POST",
          formData
        );
      }
      await mutate();
      setSheetOpen(false);
      setEditingTeam(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams/${id}`,
        "DELETE"
      );
      toast("Team has been deleted successfully!", {
      description: getIndianFormattedDate(),
      })
      await mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  //Columns definition
  const columns: ColumnDef<TeamFormValues & { _id: string }>[] = [
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
    { accessorKey: "eventName",
      header: sortableHeader("Event Name"),
     },
     { accessorKey: "paymentGateway",
      header: sortableHeader("Payment Gateway Name"),
     },
     
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
                  <span className="font-semibold">{row.original.companyName}</span>.
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
  ]

  // ✅ Filter teams by tab
  const filteredTeams = useMemo(() => {
    switch (activeTab) {
      case "Active":
        return teams.filter((o: TeamFormValues & { _id: string }) => o.status === "Active")
      case "Inactive":
        return teams.filter((o: TeamFormValues & { _id: string }) => o.status === "Inactive")
      case "Trash":
        return teams.filter((o: TeamFormValues & { _id: string }) => o.status === "Trash")
      case "All":
      default:
        return teams
    }
  }, [activeTab, teams])

     // UI
     // ✅ Replaced plain "Loading suppliers..." with EntitySkeleton
     if (isLoading) return <EntitySkeleton title="Your Payment Gateway" />;
  
    if (error) return <div className="text-red-600">Failed to load payment gateway.</div>
  

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Payment Gateway</h1>
        <Button onClick={handleAdd} className="bg-sky-800 text-white hover:bg-sky-900">
          + Add Payment Gateway
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-4 text-sm text-gray-600 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
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
      <DataTable data={filteredTeams} columns={columns} />

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:w-[600px]">
          <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
          {editingTeam ? "Edit Payment Gateway" : "Add Payment Gateway"}
          </h2>
          </div>

          <AddPaymentGateway defaultValues={editingTeam || undefined} onSave={handleSave} />
        </SheetContent>
      </Sheet>
    </div>
  )
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
