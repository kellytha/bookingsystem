"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useState } from "react";
import {
  formatBookingTimeRange,
  formatDateKey,
  useDemoBookings,
} from "../lib/demo-bookings";
import { AdminSidebar } from "./admin-sidebar";

const practitioners = [
  { name: "Sarah Chen", role: "Massage therapist", initials: "SC" },
  { name: "James Miller", role: "Massage therapist", initials: "JM" },
  { name: "Emma Wilson", role: "Facial specialist", initials: "EW" },
];

const services = [
  { name: "Deep Tissue Massage", duration: "60 min", price: "$120", description: "Targeted tension relief" },
  { name: "Relaxation Massage", duration: "60 min", price: "$100", description: "Restore your balance" },
  { name: "Restorative Facial", duration: "45 min", price: "$85", description: "A refreshing reset" },
];

type ScheduleView = "Day" | "Week" | "Month";
type OwnerSection = "Schedule" | "Services" | "Staff" | "Settings";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-slate-900" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

export function OwnerDashboard() {
  const { bookings, ready, error, resetDemoBookings } = useDemoBookings();
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section");
  const activeSection: OwnerSection =
    requestedSection === "Services" || requestedSection === "Staff" || requestedSection === "Settings"
      ? requestedSection
      : "Schedule";
  const [scheduleView, setScheduleView] = useState<ScheduleView>("Day");
  const [selectedPractitioner, setSelectedPractitioner] = useState("All practitioners");
  const [date, setDate] = useState(new Date(2026, 10, 16));
  const [onlineBooking, setOnlineBooking] = useState(true);
  const [workingHours, setWorkingHours] = useState<Record<string, boolean>>({
    "Sarah Chen": true,
    "James Miller": true,
    "Emma Wilson": true,
  });
  const [slotInterval, setSlotInterval] = useState("30 minutes");
  const [betweenAppointments, setBetweenAppointments] = useState("15 minutes");
  const [editingHours, setEditingHours] = useState(false);

  const visiblePractitioners = practitioners.filter(
    (person) =>
      selectedPractitioner === "All practitioners" ||
      person.name === selectedPractitioner,
  );
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const dateKey = formatDateKey(date);
  const visibleAppointments = bookings.filter(
    (booking) =>
      booking.status === "Accepted" &&
      booking.date === dateKey &&
      visiblePractitioners.some((person) => person.name === booking.practitioner),
  );

  function moveDate(amount: number) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + amount);
    setDate(nextDate);
  }

  function toggleWorkingHours(name: string) {
    setWorkingHours((current) => ({ ...current, [name]: !current[name] }));
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900" style={{ colorScheme: "light" }}>
      <div className="flex min-h-screen flex-col md:flex-row">
        <AdminSidebar active={activeSection} />

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <div>
                  <p className="text-sm font-semibold">{dateLabel}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Your studio&apos;s rhythm, at a glance.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => moveDate(-1)} aria-label="Previous day" className="h-8 w-8 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">‹</button>
                  <button type="button" onClick={() => setDate(new Date(2026, 10, 16))} className="h-8 rounded-lg border border-slate-200 px-3 text-[10px] hover:bg-slate-50">Today</button>
                  <button type="button" onClick={() => moveDate(1)} aria-label="Next day" className="h-8 w-8 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">›</button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="practitioner-filter">Filter by practitioner</label>
                <select
                  id="practitioner-filter"
                  value={selectedPractitioner}
                  onChange={(event) => setSelectedPractitioner(event.target.value)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                >
                  <option>All practitioners</option>
                  {practitioners.map((person) => <option key={person.name}>{person.name}</option>)}
                </select>
                <Link href="/book" className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-slate-800">
                  + &nbsp; New Booking
                </Link>
                <UserButton />
              </div>
            </div>
          </header>

          {activeSection === "Schedule" ? (
            <div className="p-4 sm:p-7">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold">Schedule</h1>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {visibleAppointments.length} appointments · {new Set(visibleAppointments.map((item) => item.practitioner)).size} practitioners
                  </p>
                </div>
                <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                  {(["Day", "Week", "Month"] as const).map((view) => (
                    <button
                      type="button"
                      key={view}
                      onClick={() => setScheduleView(view)}
                      aria-pressed={scheduleView === view}
                      className={`rounded-md px-3 py-1.5 text-[10px] ${
                        scheduleView === view ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              {!ready && <p className="mb-4 text-xs text-slate-500">Loading saved schedule…</p>}
              {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_230px]">
                <section aria-label="Practitioner schedule" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <div
                      className="grid min-w-[690px]"
                      style={{ gridTemplateColumns: `48px repeat(${visiblePractitioners.length}, minmax(0, 1fr))` }}
                    >
                      <div className="h-12 border-b border-slate-200" />
                      {visiblePractitioners.map((person) => (
                        <div key={person.name} className="flex h-12 items-center gap-2 border-b border-l border-slate-200 px-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[8px] font-semibold text-slate-600">{person.initials}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-[9px] font-semibold">{person.name}</span>
                            <span className="block truncate text-[8px] text-slate-500">{person.role}</span>
                          </span>
                        </div>
                      ))}
                      {Array.from({ length: 8 }, (_, index) => 9 + index).map((hour) => (
                        <Fragment key={hour}>
                          <div className="min-h-[74px] border-b border-slate-200 pr-2 pt-2 text-right text-[8px] text-slate-500">
                            {`${String(hour).padStart(2, "0")}:00`}
                          </div>
                          {visiblePractitioners.map((person) => {
                            const appointment = visibleAppointments.find(
                              (item) =>
                                Number(item.time.split(":")[0]) === hour &&
                                item.practitioner === person.name,
                            );
                            return (
                              <div key={`${person.name}-${hour}`} className="min-h-[74px] border-b border-l border-slate-200 p-1">
                                {appointment ? (
                                  <article className="h-full rounded-md border-l-2 border-slate-700 bg-slate-50 p-2">
                                    <p className="truncate text-[9px] font-semibold">{appointment.client}</p>
                                    <p className="mt-1 truncate text-[8px] text-slate-500">{appointment.service}</p>
                                    <p className="mt-1 text-[8px] text-slate-500">{formatBookingTimeRange(appointment.time, appointment.duration)}</p>
                                    <span className="mt-1 inline-block rounded bg-white px-1.5 py-0.5 text-[7px] text-slate-600">Confirmed</span>
                                  </article>
                                ) : hour === 12 ? (
                                  <div className="flex h-full items-center rounded-md bg-slate-50 px-2 text-[8px] text-slate-500">Lunch break</div>
                                ) : null}
                              </div>
                            );
                          })}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </section>

                <aside className="space-y-4">
                  <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="text-xs font-semibold">Working hours</h2>
                    <p className="mt-1 border-b border-slate-100 pb-3 text-[9px] text-slate-500">{dateLabel}</p>
                    <div className="divide-y divide-slate-100">
                      {practitioners.map((person) => (
                        <div key={person.name} className="flex items-center justify-between gap-2 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[8px] font-semibold">{person.initials}</span>
                            <span>
                              <span className="block text-[9px] font-medium">{person.name}</span>
                              <span className="block text-[8px] text-slate-500">{workingHours[person.name] ? "09:00 – 17:00" : "Unavailable"}</span>
                            </span>
                          </div>
                          <Toggle checked={workingHours[person.name]} onChange={() => toggleWorkingHours(person.name)} label={`${person.name} working hours`} />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setEditingHours(!editingHours)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-medium hover:bg-slate-50">
                      {editingHours ? "Done" : "Manage working hours"}
                    </button>
                    {editingHours && <p className="mt-2 text-[9px] text-slate-500">Toggle a practitioner to change their availability for this demo day.</p>}
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="text-xs font-semibold">Booking preferences</h2>
                    <div className="flex items-center justify-between border-b border-slate-100 py-3">
                      <span>
                        <span className="block text-[9px] font-medium">Online booking</span>
                        <span className="block text-[8px] text-slate-500">Accept bookings from your page</span>
                      </span>
                      <Toggle checked={onlineBooking} onChange={() => setOnlineBooking(!onlineBooking)} label="Online booking" />
                    </div>
                    <label className="flex items-center justify-between gap-2 border-b border-slate-100 py-3 text-[9px]">
                      Slot interval
                      <select value={slotInterval} onChange={(event) => setSlotInterval(event.target.value)} className="rounded border-0 bg-transparent text-right text-[9px]">
                        <option>15 minutes</option><option>30 minutes</option><option>60 minutes</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-between gap-2 pt-3 text-[9px]">
                      Between appointments
                      <select value={betweenAppointments} onChange={(event) => setBetweenAppointments(event.target.value)} className="rounded border-0 bg-transparent text-right text-[9px]">
                        <option>0 minutes</option><option>15 minutes</option><option>30 minutes</option>
                      </select>
                    </label>
                  </section>
                  <p className="text-[9px] leading-5 text-slate-500">◷ &nbsp;All times in New York<br />GMT−05:00 · Eastern Standard Time</p>
                </aside>
              </div>
              <div className="mt-5 flex justify-between text-[9px] text-slate-500">
                <span>A little structure. More space for care.</span>
                <span>All appointments are up to date</span>
              </div>
            </div>
          ) : (
            <WorkspaceSection
              section={activeSection}
              workingHours={workingHours}
              toggleWorkingHours={toggleWorkingHours}
              onlineBooking={onlineBooking}
              toggleOnlineBooking={() => setOnlineBooking(!onlineBooking)}
              resetDemoBookings={resetDemoBookings}
              error={error}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function WorkspaceSection({
  section,
  workingHours,
  toggleWorkingHours,
  onlineBooking,
  toggleOnlineBooking,
  resetDemoBookings,
  error,
}: {
  section: Exclude<OwnerSection, "Schedule">;
  workingHours: Record<string, boolean>;
  toggleWorkingHours: (name: string) => void;
  onlineBooking: boolean;
  toggleOnlineBooking: () => void;
  resetDemoBookings: () => boolean;
  error: string | null;
}) {
  return (
    <div className="mx-auto max-w-5xl p-5 sm:p-8">
      <p className="text-sm font-medium text-teal-700">Studio management</p>
      <h1 className="mt-1 text-2xl font-semibold">{section}</h1>
      {section === "Services" && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article key={service.name} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="font-semibold">{service.name}</p>
              <p className="mt-2 text-sm text-slate-500">{service.description}</p>
              <div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">{service.duration}</span><span className="font-semibold">{service.price}</span>
              </div>
            </article>
          ))}
        </div>
      )}
      {section === "Staff" && (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {practitioners.map((person) => (
            <div key={person.name} className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">{person.initials}</span>
                <span><span className="block text-sm font-medium">{person.name}</span><span className="text-xs text-slate-500">{person.role}</span></span>
              </div>
              <Toggle checked={workingHours[person.name]} onChange={() => toggleWorkingHours(person.name)} label={`${person.name} working hours`} />
            </div>
          ))}
        </div>
      )}
      {section === "Settings" && (
        <div className="mt-6 max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span><span className="block text-sm font-medium">Online booking</span><span className="text-xs text-slate-500">Allow clients to book from your public page.</span></span>
            <Toggle checked={onlineBooking} onChange={toggleOnlineBooking} label="Online booking" />
          </div>
          <p className="pt-4 text-xs text-slate-500">Bookings and decisions are stored only in this browser. They do not sync to other devices, and no email or payment is processed.</p>
          {error && <p role="alert" className="mt-3 text-xs text-red-700">{error}</p>}
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all demo bookings and decisions to the sample data?")) {
                resetDemoBookings();
              }
            }}
            className="mt-5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium hover:bg-slate-50"
          >
            Reset demo data
          </button>
        </div>
      )}
    </div>
  );
}
