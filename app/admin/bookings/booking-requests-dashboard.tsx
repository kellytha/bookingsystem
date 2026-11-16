"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import {
  formatBookingLongDate,
  formatBookingShortDate,
  formatBookingTimeRange,
  formatRequestedAt,
  useDemoBookings,
  type BookingStatus,
} from "../../lib/demo-bookings";
import { AdminSidebar } from "../admin-sidebar";

const tabs: BookingStatus[] = ["Pending", "Accepted", "Declined"];

export function BookingRequestsDashboard() {
  const { bookings, ready, error, saveBookings } = useDemoBookings();
  const [activeTab, setActiveTab] = useState<BookingStatus>("Pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const matchingRequests = bookings.filter((request) => {
    const matchesTab = request.status === activeTab;
    const searchValue = search.trim().toLowerCase();
    const matchesSearch =
      !searchValue ||
      [request.client, request.email, request.service, request.practitioner]
        .some((value) => value.toLowerCase().includes(searchValue));
    return matchesTab && matchesSearch;
  });
  const selectedRequest =
    matchingRequests.find((request) => request.id === selectedId) ?? matchingRequests[0];

  function decideRequest(status: Exclude<BookingStatus, "Pending">) {
    if (!selectedRequest) return;
    if (
      saveBookings((current) =>
        current.map((request) =>
          request.id === selectedRequest.id ? { ...request, status } : request,
        ),
      )
    ) {
      setActiveTab(status);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900" style={{ colorScheme: "light" }}>
      <div className="flex min-h-screen flex-col md:flex-row">
        <AdminSidebar active="Bookings" />
        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7">
              <div>
                <h1 className="text-sm font-semibold">Booking management</h1>
                <p className="mt-1 text-[10px] text-slate-500">
                  A thoughtful welcome starts with a confirmed appointment.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden text-[9px] text-slate-500 sm:inline">◷ &nbsp;New York · GMT−05:00</span>
                <Link href="/book" className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-slate-800">
                  + &nbsp; New Booking
                </Link>
                <UserButton />
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Booking requests</h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Review the details, then welcome your next client.
                </p>
              </div>
              <p className="text-[9px] text-slate-500">{formatBookingLongDate("2026-11-16")}</p>
            </div>

            {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(290px,0.75fr)]">
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div role="tablist" aria-label="Booking request status" className="flex border-b border-slate-200 px-4 pt-2">
                  {tabs.map((tab) => {
                    const count = bookings.filter((request) => request.status === tab).length;
                    return (
                      <button
                        type="button"
                        role="tab"
                        key={tab}
                        aria-selected={activeTab === tab}
                        onClick={() => setActiveTab(tab)}
                        className={`mr-4 flex items-center gap-2 border-b-2 px-1 py-3 text-[10px] ${
                          activeTab === tab
                            ? "border-slate-900 font-semibold text-slate-900"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {tab}
                        <span className={`rounded px-1.5 py-0.5 text-[8px] ${activeTab === tab ? "bg-slate-100 text-slate-700" : "bg-transparent"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-b border-slate-100 p-3">
                  <label className="relative block">
                    <span className="sr-only">Search clients or services</span>
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search clients or services..."
                      className="h-9 w-full rounded-md border border-slate-200 pl-9 pr-3 text-[10px] outline-none focus:border-slate-400"
                    />
                  </label>
                </div>

                <div className="hidden grid-cols-[1fr_1.1fr_1fr_16px] gap-3 bg-slate-50 px-4 py-2 text-[7px] font-medium uppercase text-slate-500 sm:grid">
                  <span>Client</span><span>Service / practitioner</span><span>Requested time</span><span />
                </div>
                <div>
                  {matchingRequests.map((request) => (
                    <button
                      type="button"
                      key={request.id}
                      onClick={() => setSelectedId(request.id)}
                      aria-pressed={selectedRequest?.id === request.id}
                      className={`grid w-full grid-cols-1 gap-2 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 sm:grid-cols-[1fr_1.1fr_1fr_16px] sm:items-center sm:gap-3 ${
                        selectedRequest?.id === request.id ? "border-l-2 border-l-slate-800 bg-slate-50" : ""
                      }`}
                    >
                      <span>
                        <span className="block text-[9px] font-semibold">{request.client}</span>
                        <span className="mt-1 block truncate text-[8px] text-slate-500">{request.email}</span>
                      </span>
                      <span>
                        <span className="block text-[9px] font-medium">{request.service}</span>
                        <span className="mt-1 block text-[8px] text-slate-500">{request.practitioner} · {request.duration} min</span>
                      </span>
                      <span>
                        <span className="block text-[9px] font-medium">{formatBookingShortDate(request.date)}</span>
                        <span className="mt-1 block text-[8px] text-slate-500">{formatBookingTimeRange(request.time, request.duration)}</span>
                      </span>
                      <span className="hidden text-base text-slate-400 sm:inline">›</span>
                    </button>
                  ))}
                  {!ready ? (
                    <p className="px-4 py-12 text-center text-xs text-slate-500">Loading demo booking requests…</p>
                  ) : matchingRequests.length === 0 && (
                    <p className="px-4 py-12 text-center text-xs text-slate-500">
                      No {activeTab.toLowerCase()} requests match your search.
                    </p>
                  )}
                </div>
                <div className="flex justify-between px-4 py-3 text-[8px] text-slate-500">
                  <span>Showing {matchingRequests.length} {activeTab.toLowerCase()} requests</span>
                  <span>Newest first</span>
                </div>
              </section>

              <section aria-label="Selected booking request" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                {selectedRequest ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[8px] font-medium">{selectedRequest.status === "Pending" ? "Pending approval" : selectedRequest.status}</span>
                      <span className="text-[8px] text-slate-500">#{selectedRequest.id}</span>
                    </div>
                    <h2 className="mt-4 text-base font-semibold">{selectedRequest.client}</h2>
                    <p className="mt-1 text-[9px] text-slate-500">{formatRequestedAt(selectedRequest.requestedAt)}</p>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <h3 className="text-[8px] font-semibold uppercase text-slate-500">Client details</h3>
                      <dl className="mt-3 space-y-3 text-[9px]">
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Age</dt><dd className="font-medium">{selectedRequest.age ?? "Not provided"}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Phone number</dt><dd className="font-medium">{selectedRequest.phone ?? "Not provided"}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Email</dt><dd className="break-all text-right font-medium">{selectedRequest.email}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-slate-500">Location</dt><dd className="text-right font-medium">{selectedRequest.location}</dd></div>
                      </dl>
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <h3 className="text-[8px] font-semibold uppercase text-slate-500">Appointment</h3>
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold">{selectedRequest.service}</p>
                          <p className="mt-1 text-[9px] text-slate-500">{selectedRequest.duration} min · with {selectedRequest.practitioner}</p>
                        </div>
                        <span className="text-xs font-semibold">${selectedRequest.price}</span>
                      </div>
                      <p className="mt-4 text-[9px]">▣ &nbsp;{formatBookingLongDate(selectedRequest.date)}</p>
                      <p className="mt-2 text-[9px] text-slate-500">◷ &nbsp;{formatBookingTimeRange(selectedRequest.time, selectedRequest.duration)} · New York</p>
                      {selectedRequest.notes && <p className="mt-3 rounded-md bg-slate-50 p-2 text-[9px] text-slate-600">Note: {selectedRequest.notes}</p>}
                    </div>

                    {selectedRequest.status === "Pending" ? (
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => decideRequest("Accepted")} className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-[9px] font-medium text-white hover:bg-slate-800">✓ &nbsp; Accept booking</button>
                          <button type="button" onClick={() => decideRequest("Declined")} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[9px] font-medium hover:bg-slate-50">Decline</button>
                        </div>
                        <p className="mt-3 text-[8px] leading-4 text-slate-500">Demo only: decisions are saved in this browser. No email will be sent.</p>
                      </div>
                    ) : (
                      <p className="mt-4 border-t border-slate-200 pt-4 text-[9px] text-slate-500">
                        This request is {selectedRequest.status.toLowerCase()}.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-500">
                    {ready ? "Select a booking request to review its details." : "Loading booking details…"}
                  </div>
                )}
              </section>
            </div>

            <div className="mt-5 flex flex-wrap justify-between gap-2 text-[8px] text-slate-500">
              <span>◷ &nbsp;Accepted bookings appear in your schedule.</span>
              <span>All times in New York · GMT−05:00</span>
              <span>{bookings.filter((request) => request.status === "Pending").length} requests awaiting your decision</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
