"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type BookingStatus = "Pending" | "Accepted" | "Declined";

export type DemoBooking = {
  id: string;
  status: BookingStatus;
  client: string;
  email: string;
  phone?: string;
  age?: string;
  location: string;
  service: string;
  practitioner: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  requestedAt: string;
  notes?: string;
};

const STORAGE_KEY = "aura-wellness-demo-bookings-v1";
const CHANGE_EVENT = "aura-wellness-demo-bookings-changed";

const services = [
  { name: "Deep Tissue Massage", duration: 60, price: 120 },
  { name: "Relaxation Massage", duration: 60, price: 100 },
  { name: "Restorative Facial", duration: 45, price: 85 },
];

const practitioners = ["Sarah Chen", "James Miller", "Emma Wilson"];

function seedBooking(
  id: string,
  status: BookingStatus,
  client: string,
  service: string,
  practitioner: string,
  date: string,
  time: string,
  index: number,
): DemoBooking {
  const serviceDetails = services.find((item) => item.name === service) ?? services[0];
  const emailName = client.toLowerCase().replace(/ /g, ".");

  return {
    id,
    status,
    client,
    email: `${emailName}@example.com`,
    phone: `+1 (212) 555-${String(1400 + index).slice(-4)}`,
    age: `${27 + (index % 12)} years`,
    location: "New York, United States",
    service,
    practitioner,
    date,
    time,
    duration: serviceDetails.duration,
    price: serviceDetails.price,
    requestedAt: "2026-11-16T13:42:00.000Z",
  };
}

const seedBookings: DemoBooking[] = [
  seedBooking("AW-1049", "Pending", "Olivia Bennett", "Deep Tissue Massage", practitioners[0], "2026-11-17", "09:00", 1),
  seedBooking("AW-1050", "Pending", "Noah Williams", "Deep Tissue Massage", practitioners[1], "2026-11-17", "10:30", 2),
  seedBooking("AW-1051", "Pending", "Sophia Davis", "Restorative Facial", practitioners[2], "2026-11-17", "13:00", 3),
  seedBooking("AW-1052", "Pending", "Ava Thompson", "Relaxation Massage", practitioners[0], "2026-11-17", "14:30", 4),
  seedBooking("AW-1053", "Pending", "Ethan Parker", "Relaxation Massage", practitioners[1], "2026-11-18", "09:00", 5),
  seedBooking("AW-1054", "Pending", "Lily Anderson", "Restorative Facial", practitioners[2], "2026-11-18", "11:00", 6),
  seedBooking("AW-1055", "Accepted", "Amelia Brooks", "Deep Tissue Massage", practitioners[0], "2026-11-16", "09:00", 7),
  seedBooking("AW-1056", "Accepted", "Noah Carter", "Deep Tissue Massage", practitioners[1], "2026-11-16", "10:00", 8),
  seedBooking("AW-1057", "Accepted", "Sophia Reed", "Restorative Facial", practitioners[2], "2026-11-16", "10:00", 9),
  seedBooking("AW-1058", "Accepted", "Ethan Parker", "Relaxation Massage", practitioners[0], "2026-11-16", "11:00", 10),
  seedBooking("AW-1059", "Accepted", "Olivia Bennett", "Deep Tissue Massage", practitioners[0], "2026-11-16", "13:00", 11),
  seedBooking("AW-1060", "Accepted", "Ava Thompson", "Relaxation Massage", practitioners[1], "2026-11-16", "13:00", 12),
  seedBooking("AW-1061", "Accepted", "Lily Anderson", "Restorative Facial", practitioners[2], "2026-11-16", "14:00", 13),
  seedBooking("AW-1062", "Accepted", "Theo Martin", "Relaxation Massage", practitioners[0], "2026-11-16", "15:00", 14),
  seedBooking("AW-1063", "Declined", "Mia Foster", "Relaxation Massage", practitioners[0], "2026-11-19", "10:00", 15),
  seedBooking("AW-1064", "Declined", "Jack Reed", "Restorative Facial", practitioners[2], "2026-11-19", "14:00", 16),
];

function isBookingStatus(value: unknown): value is BookingStatus {
  return value === "Pending" || value === "Accepted" || value === "Declined";
}

function isDemoBooking(value: unknown): value is DemoBooking {
  if (!value || typeof value !== "object") return false;
  const booking = value as Record<string, unknown>;
  return (
    typeof booking.id === "string" &&
    isBookingStatus(booking.status) &&
    typeof booking.client === "string" &&
    typeof booking.email === "string" &&
    typeof booking.location === "string" &&
    typeof booking.service === "string" &&
    typeof booking.practitioner === "string" &&
    typeof booking.date === "string" &&
    typeof booking.time === "string" &&
    typeof booking.duration === "number" &&
    typeof booking.price === "number" &&
    typeof booking.requestedAt === "string"
  );
}

function readStoredBookings(): DemoBooking[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedBookings));
    return seedBookings;
  }

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed) || !parsed.every(isDemoBooking)) {
    throw new Error("Saved demo bookings have an invalid format.");
  }
  return parsed;
}

export function useDemoBookings() {
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bookingsRef = useRef<DemoBooking[]>([]);

  const loadBookings = useCallback(() => {
    try {
      const loaded = readStoredBookings();
      bookingsRef.current = loaded;
      setBookings(loaded);
      setError(null);
    } catch (cause) {
      bookingsRef.current = [];
      setBookings([]);
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load demo bookings from this browser.",
      );
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadBookings, 0);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) loadBookings();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(CHANGE_EVENT, loadBookings);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CHANGE_EVENT, loadBookings);
    };
  }, [loadBookings]);

  const saveBookings = useCallback(
    (update: (current: DemoBooking[]) => DemoBooking[]) => {
      if (!ready) {
        setError("Demo data is still loading. Please try again in a moment.");
        return false;
      }

      try {
        const updated = update(bookingsRef.current);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        bookingsRef.current = updated;
        setBookings(updated);
        setError(null);
        window.dispatchEvent(new Event(CHANGE_EVENT));
        return true;
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to save demo bookings in this browser.",
        );
        return false;
      }
    },
    [ready],
  );

  const resetDemoBookings = useCallback(
    () => saveBookings(() => seedBookings),
    [saveBookings],
  );

  return { bookings, ready, error, saveBookings, resetDemoBookings };
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00`);
}

export function formatBookingLongDate(dateKey: string) {
  return dateFromKey(dateKey).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBookingShortDate(dateKey: string) {
  return dateFromKey(dateKey).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatBookingTimeRange(time: string, duration: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const start = hours * 60 + minutes;
  const end = start + duration;

  const format = (totalMinutes: number) =>
    `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;

  return `${format(start)} – ${format(end)}`;
}

export function formatRequestedAt(value: string) {
  return `Requested ${new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} at ${new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
