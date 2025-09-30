"use client";
import React, { useState, useEffect } from "react";
import { AssignFormSchema, AssignFormValues } from "@/validations/assignSchema";
import {
  zodResolver,
  useForm,
  toast,
  items,
  SheetClose,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Form,
  FormField,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/imports";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { getIndianFormattedDate } from "@/lib/formatIndianDate";

type AddAssignFormProps = {
  defaultValues?: {
    _id: string; // assignment doc id (eventAdminId)
    eventId?: string;
    eventAdminId?: string;
    eventIds?: { _id: string; eventName: string }[];
    team?: { _id: string; companyName: string };
    items: string[];
  };
  onSave: (savedAssign: any) => void;
};

export default function AddAssignForm({
  defaultValues,
  onSave,
}: AddAssignFormProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ always initialize items as []
  const form = useForm<AssignFormValues>({
    resolver: zodResolver(AssignFormSchema),
    defaultValues: { eventId: "", eventAdminId: "", items: [] },
  });

  // ✅ Load events & teams first
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [eventRes, teamRes] = await Promise.all([
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/events`),
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/teams`),
        ]);

        if (!eventRes.ok || !teamRes.ok)
          throw new Error("Failed to load dropdown data");

        const [eventJson, teamJson] = await Promise.all([
          eventRes.json(),
          teamRes.json(),
        ]);
        setEvents(eventJson.data || []);
        setTeams(teamJson.data || []);

        // ✅ Reset form only after options loaded
        if (defaultValues) {
          form.reset({
            eventId:
              defaultValues.eventId ||
              defaultValues?.eventIds?.[0]?._id ||
              "",
            eventAdminId:
              defaultValues.eventAdminId || defaultValues?.team?._id || "",
            items: defaultValues.items || [],
          });
        }
      } catch (error) {
        console.error("Failed to load dropdowns:", error);
        toast.error("❌ Failed to fetch dropdown data");
      }
    };

    fetchDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  // ✅ Submit → POST/PUT
  async function onSubmit(data: AssignFormValues) {
    try {
      setLoading(true);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-assign`;
      let method: "POST" | "PUT" = "POST";
      let body: any = {};

      if (defaultValues) {
        // Editing → PUT
        method = "PUT";
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/event-assign/${defaultValues._id}`;
        body = {
          oldEventId:
            defaultValues?.eventId || defaultValues?.eventIds?.[0]?._id || "",
          oldEventAdminId: defaultValues?._id, // company before edit
          newEventId: data.eventId,
          newEventAdminId: data.eventAdminId, // company after edit
          items: data.items,
        };
      } else {
        // Creating → POST
        body = {
          eventId: data.eventId,
          eventAdminId: data.eventAdminId,
          items: data.items,
        };
      }

      const res = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || result.message || "Failed to save assign");

      // ✅ Two separate toast messages
      if (defaultValues?._id) {
        toast.success("Assigned event has updated successfully!", {
          description: getIndianFormattedDate(),
        });
      } else {
        toast.success("Event has assigned successfully!", {
          description: getIndianFormattedDate(),
        });
      }

      onSave(result.data); // ✅ backend returns { data: eventAdmin }
      form.reset({ eventId: "", eventAdminId: "", items: [] });
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto custom-scroll">
        <Form {...form}>
          <form className="space-y-4 pr-3 pl-3">
            {/* Event Dropdown */}
            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Select Event *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // ✅ ensures pre-selected
                  >
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="Select event">
                        {events.find((e) => e._id === field.value)?.eventName ||
                          "Select event"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event._id} value={event._id}>
                          {event.eventName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Dropdown */}
            <FormField
              control={form.control}
              name="eventAdminId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Select Team Member *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // ✅ ensures pre-selected
                  >
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="Select team">
                        {teams.find((t) => t._id === field.value)?.name ||
                          "Select team"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team._id} value={team._id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sidebar items checkboxes */}
            <FormField
              control={form.control}
              name="items"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">All Modules *</FormLabel>
                    <FormDescription>
                      Select the module you want to give the access.
                    </FormDescription>
                  </div>
                  {items.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="items"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-center gap-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 border-t px-6 py-4 flex justify-between">
        <SheetClose asChild>
          <Button
            type="button"
            variant="outline"
            className="border border-gray-400"
          >
            Close
          </Button>
        </SheetClose>
        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-sky-800 text-white hover:bg-sky-900"
        >
          {loading ? "Saving..." : defaultValues ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}
