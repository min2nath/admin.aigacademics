"use client";

import { useState } from "react";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import useSWR, { mutate } from "swr";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import EventCard from "@/components/EventCard";
import AddEventForm from "@/components/forms/AddEventForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EventType } from "@/types/event";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Tabs ---
const tabs = ["Running", "Live", "Past", "All", "Trash"];

export default function EventsPageClient({
  initialEvents,
}: {
  initialEvents: EventType[];
}) {
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/events`;

  const [open, setOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventType | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Live");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch events with SWR
  const { data, isLoading } = useSWR(API_URL, fetcher, {
    fallbackData: initialEvents,
  });

  // Ensure events is always an array
  const events: EventType[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];

  // --- Filtering ---
  const filteredByTab =
    activeTab === "All"
      ? events
      : events.filter((event) => event.dynamicStatus === activeTab);

  const filteredEvents = filteredByTab.filter((event) =>
    (event.eventName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // --- Pagination ---
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // --- Handlers ---
  function handleAddEvent() {
    setEventToEdit(null); // Add mode
    setOpen(true);
  }

  function handleEditEvent(event: EventType) {
    setEventToEdit(event); // Edit mode
    setOpen(true);
  }

  async function handleSuccess() {
    await mutate(API_URL);
    setOpen(false);
    setEventToEdit(null);
  }

  return (
    <div className="p-4 bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Events</h1>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              className="bg-sky-800 hover:bg-sky-900 text-white cursor-pointer"
              onClick={handleAddEvent}
            >
              + Add Event
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:max-w-[50vw] md:max-w-[50vw]"
          >
            <AddEventForm onSuccess={handleSuccess} eventToEdit={eventToEdit} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-4 text-sm text-gray-600 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
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

      {/* Search */}
      <div className="relative w-[300px] mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-100 transition-colors duration-200"
        />
      </div>

      {/* Events / Skeleton */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="flex flex-col gap-4">
          {paginatedEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={() => handleEditEvent(event)}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[30vh] w-full border border-gray-300 p-4 rounded">
          <div className="text-center">
            <Image
              src="https://res.cloudinary.com/dr5kn8993/image/upload/v1752307409/AIG_Event_Software/icons/not-found.png"
              alt="Not Found Icon"
              width={150}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-base text-gray-600">
              We could not find anything matching your search criteria.
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded transition-colors duration-200 ${
                currentPage === i + 1
                  ? "bg-[#035D8A] text-white"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
