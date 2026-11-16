"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  formatDateKey,
  useDemoBookings,
  type DemoBooking,
} from "../lib/demo-bookings";

const services = [
  { name: "Deep Tissue Massage", duration: "60 min", detail: "Targeted tension relief", price: 120 },
  { name: "Relaxation Massage", duration: "60 min", detail: "Restore your balance", price: 100 },
  { name: "Restorative Facial", duration: "45 min", detail: "A refreshing reset", price: 85 },
];

const practitioners = [
  { name: "Sarah", fullName: "Sarah Chen", role: "Massage therapist", initials: "SC" },
  { name: "James", fullName: "James Miller", role: "Massage therapist", initials: "JM" },
  { name: "Emma", fullName: "Emma Wilson", role: "Facial specialist", initials: "EW" },
];

const timeSlots = ["09:00", "10:30", "11:30", "13:00", "14:30", "15:30", "16:00", "16:30"];
const unavailableSlots = new Set(["11:30", "15:30", "16:30"]);

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function createBookingId() {
  return `AW-${crypto.randomUUID()}`;
}

export function BookingWizard({ initialService }: { initialService?: string }) {
  const [step, setStep] = useState(2);
  const [serviceName, setServiceName] = useState(
    services.find((item) => item.name === initialService)?.name ?? services[0].name,
  );
  const [practitionerName, setPractitionerName] = useState(practitioners[0].name);
  const [weekStart, setWeekStart] = useState(new Date(2026, 10, 16));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 10, 16));
  const [selectedTime, setSelectedTime] = useState("");
  const [timezone, setTimezone] = useState("New York · GMT−05:00");
  const [confirmed, setConfirmed] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState("");
  const { bookings, ready, error, saveBookings } = useDemoBookings();

  const service = services.find((item) => item.name === serviceName) ?? services[0];
  const practitioner = practitioners.find((item) => item.name === practitionerName) ?? practitioners[0];
  const dateKey = formatDateKey(selectedDate);
  function isTimeUnavailable(time: string) {
    if (unavailableSlots.has(time)) return true;
    const [hours, minutes] = time.split(":").map(Number);
    const start = hours * 60 + minutes;
    const end = start + Number.parseInt(service.duration, 10);
    return bookings.some((booking) => {
      if (
        booking.date !== dateKey ||
        booking.practitioner !== practitioner.fullName ||
        booking.status === "Declined"
      ) {
        return false;
      }
      const [bookingHours, bookingMinutes] = booking.time.split(":").map(Number);
      const bookingStart = bookingHours * 60 + bookingMinutes;
      const bookingEnd = bookingStart + booking.duration;
      return start < bookingEnd && bookingStart < end;
    });
  }
  const availableCount = timeSlots.filter((time) => !isTimeUnavailable(time)).length;
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });
  const dateLabel = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const monthLabel = weekStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function moveWeek(amount: number) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + amount * 7);
    setWeekStart(next);
    setSelectedDate(next);
    setSelectedTime("");
  }

  function confirmBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || error || !selectedTime || isTimeUnavailable(selectedTime)) return;

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const region = timezone.split(" · ")[0];
    const locationByTimezone: Record<string, string> = {
      "New York": "New York, United States",
      "Los Angeles": "Los Angeles, United States",
      London: "London, United Kingdom",
    };
    const booking: DemoBooking = {
      id: createBookingId(),
      status: "Pending",
      client: `${firstName} ${lastName}`,
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      location: locationByTimezone[region] ?? region,
      service: service.name,
      practitioner: practitioner.fullName,
      date: dateKey,
      time: selectedTime,
      duration: Number.parseInt(service.duration, 10),
      price: service.price,
      requestedAt: new Date().toISOString(),
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    };

    if (saveBookings((current) => [booking, ...current])) {
      setCreatedBookingId(booking.id);
      setConfirmed(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-28 text-slate-900" style={{ colorScheme: "light" }}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[920px] items-center justify-between px-5">
          <Link href="/" aria-label="Aura Wellness home" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-700 text-xs">◉</span>
            <span className="leading-none">
              <span className="block text-lg font-semibold">aura</span>
              <span className="mt-1 block text-[8px] tracking-[0.3em] text-slate-500">WELLNESS</span>
            </span>
          </Link>
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-600">
            <span aria-hidden="true">◎</span>
            <span className="sr-only">Time zone</span>
            <select
              aria-label="Time zone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="max-w-36 border-0 bg-transparent p-0 text-[10px] outline-none"
            >
              <option>New York · GMT−05:00</option>
              <option>Los Angeles · GMT−08:00</option>
              <option>London · GMT+00:00</option>
            </select>
          </label>
        </div>
      </header>

      <div className="mx-auto max-w-[920px] px-5 pb-8 pt-8 sm:pt-10">
        <div className="mb-7">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">A little time for you</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Your next moment of calm.</h1>
          <p className="mt-2 text-xs text-slate-500">Choose your treatment, find your time, and leave the rest to us.</p>
          {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        </div>

        <ol aria-label="Booking steps" className="mb-8 grid grid-cols-3 text-[10px]">
          {["Service", "Time", "Details"].map((label, index) => {
            const number = index + 1;
            return (
              <li key={label} className={`flex items-center gap-2 ${number === step ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                  number < step || confirmed
                    ? "border-slate-900 bg-slate-900 text-white"
                    : number === step
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white"
                }`}>
                  {number < step || confirmed ? "✓" : number}
                </span>
                <button
                  type="button"
                  disabled={number > step}
                  onClick={() => setStep(number)}
                  className="disabled:cursor-default"
                >
                  {label}
                </button>
                {number < 3 && <span className="ml-1 h-px flex-1 bg-slate-200" />}
              </li>
            );
          })}
        </ol>

        {confirmed ? (
          <section className="rounded-xl border border-slate-200 bg-white p-7 text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-lg text-teal-700">✓</span>
            <h2 className="mt-4 text-lg font-semibold">Your request is received</h2>
            <p className="mt-2 text-sm text-slate-600">
              {serviceName} with {practitioner.fullName} on {dateLabel} at {formatTime(selectedTime)}.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Request #{createdBookingId} is saved and pending studio approval. This demo stores data in this browser only; no email or payment is sent.
            </p>
            <Link href="/" className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
              Back to Aura Wellness
            </Link>
          </section>
        ) : (
          <form onSubmit={confirmBooking}>
            {step <= 2 && (
              <div className="grid gap-5 md:grid-cols-2">
                <section>
                  <p className="mb-3 text-[9px] font-medium uppercase tracking-wide text-slate-500">01 &nbsp; Service &amp; practitioner</p>
                  <div className="space-y-2">
                    {services.map((item) => (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setServiceName(item.name)}
                        aria-pressed={serviceName === item.name}
                        className={`w-full rounded-lg border bg-white p-3 text-left transition ${
                          serviceName === item.name ? "border-slate-800 ring-1 ring-slate-800" : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="flex min-w-0 items-start gap-2">
                            <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border ${serviceName === item.name ? "border-slate-900 bg-slate-900 ring-2 ring-white" : "border-slate-300"}`} />
                            <span>
                              <span className="block text-[11px] font-semibold">{item.name}</span>
                              <span className="mt-1 block text-[9px] text-slate-500">{item.duration} · {item.detail}</span>
                            </span>
                          </span>
                          <span className="text-[10px] font-semibold">${item.price}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-5">
                    <p className="text-[10px] font-medium">Choose your practitioner</p>
                    <p className="mt-1 text-[9px] text-slate-500">A familiar face, or someone new.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {practitioners.map((person) => (
                        <button
                          type="button"
                          key={person.name}
                          onClick={() => setPractitionerName(person.name)}
                          aria-pressed={practitionerName === person.name}
                          className={`flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-[10px] ${
                            practitionerName === person.name ? "border-slate-800 text-slate-900" : "border-slate-200 text-slate-600"
                          }`}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[8px] font-semibold">{person.initials}</span>
                          {person.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">02 &nbsp; Find your time</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">{monthLabel}</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => moveWeek(-1)} aria-label="Previous week" className="rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50">‹</button>
                      <button type="button" onClick={() => moveWeek(1)} aria-label="Next week" className="rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50">›</button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-1">
                    {dates.map((date) => (
                      <button
                        type="button"
                        key={date.toISOString()}
                        onClick={() => { setSelectedDate(date); setSelectedTime(""); }}
                        aria-pressed={date.toDateString() === selectedDate.toDateString()}
                        className={`rounded-lg border py-2 text-center ${
                          date.toDateString() === selectedDate.toDateString()
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-[8px]">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                        <span className="mt-1 block text-xs font-semibold">{date.getDate()}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] font-medium">{dateLabel}</p>
                    <span className="text-[8px] text-slate-500">
                      {ready ? `${availableCount} available` : "Checking availability…"}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => {
                      const unavailable = !ready || isTimeUnavailable(time);
                      return (
                        <button
                          type="button"
                          key={time}
                          disabled={unavailable}
                          onClick={() => setSelectedTime(time)}
                          aria-pressed={selectedTime === time}
                          className={`rounded-md border px-2 py-2 text-[9px] ${
                            unavailable
                              ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400 line-through"
                              : selectedTime === time
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-500"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-[8px] text-slate-500">◷ &nbsp;All appointments are in your local time.</p>
                </section>
              </div>
            )}

            {step === 3 && (
              <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">03 &nbsp; Your details</p>
                <h2 className="mt-2 text-base font-semibold">Who is this appointment for?</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-[10px] font-medium">
                    First name
                    <input name="firstName" required autoComplete="given-name" className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs font-normal" placeholder="First name" />
                  </label>
                  <label className="text-[10px] font-medium">
                    Last name
                    <input name="lastName" required autoComplete="family-name" className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs font-normal" placeholder="Last name" />
                  </label>
                  <label className="text-[10px] font-medium sm:col-span-2">
                    Email address
                    <input name="email" required type="email" autoComplete="email" className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs font-normal" placeholder="you@example.com" />
                  </label>
                  <label className="text-[10px] font-medium sm:col-span-2">
                    Phone number <span className="font-normal text-slate-500">(optional)</span>
                    <input name="phone" type="tel" autoComplete="tel" className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 text-xs font-normal" placeholder="(555) 000-0000" />
                  </label>
                  <label className="text-[10px] font-medium sm:col-span-2">
                    Anything we should know? <span className="font-normal text-slate-500">(optional)</span>
                    <textarea name="notes" rows={3} className="mt-2 w-full resize-y rounded-md border border-slate-200 px-3 py-2.5 text-xs font-normal" placeholder="Share a note for your practitioner" />
                  </label>
                </div>
                <p className="mt-4 text-[9px] text-slate-500">No payment is collected in this demo.</p>
                {selectedTime && isTimeUnavailable(selectedTime) && (
                  <p role="alert" className="mt-3 text-xs text-red-700">
                    This time is no longer available. Go back and choose another slot.
                  </p>
                )}
              </section>
            )}

            <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur">
              <div className="mx-auto flex max-w-[920px] flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold">{serviceName}</p>
                  <p className="mt-1 truncate text-[9px] text-slate-500">
                    {dateLabel} · {selectedTime ? formatTime(selectedTime) : "Select a time"} · with {practitionerName}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-right">
                    <span className="block text-base font-semibold">${service.price}</span>
                    <span className="block text-[8px] text-slate-500">{service.duration}</span>
                  </span>
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="rounded-lg border border-slate-200 px-4 py-3 text-xs font-medium hover:bg-slate-50">
                      Back
                    </button>
                  )}
                  <button
                    type={step === 3 ? "submit" : "button"}
                    onClick={step < 3 ? () => setStep(step + 1) : undefined}
                    disabled={(step === 2 && (!ready || !selectedTime || isTimeUnavailable(selectedTime))) || (step === 3 && (!ready || Boolean(error) || !selectedTime || isTimeUnavailable(selectedTime)))}
                    className="rounded-lg bg-slate-900 px-5 py-3 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {step === 3 ? "Confirm appointment" : step === 1 ? "Continue to time" : "Continue to details"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
