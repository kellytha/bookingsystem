import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Suspense } from "react";
import { hasAdminRole } from "./lib/admin-access";

async function UserSessionActions() {
  const { userId, sessionClaims } = await auth();
  const user = userId ? await currentUser() : null;
  const hasAdminPortalAccess = hasAdminRole(sessionClaims, user?.publicMetadata);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {userId && user ? (
        <div className="flex items-center gap-3">
          {hasAdminPortalAccess && (
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:px-4"
            >
              <span className="sm:hidden">Admin</span>
              <span className="hidden sm:inline">Admin portal</span>
            </Link>
          )}
          <span className="hidden text-sm text-slate-600 sm:inline">
            {user.firstName ?? "Member"}
          </span>
          <UserButton />
        </div>
      ) : (
        <>
          <Link
            href="/sign-in"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Create account
          </Link>
        </>
      )}
    </div>
  );
}

function UserBookingCTA() {
  return (
    <Link
      href="/book"
      className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      Browse today&apos;s sessions
    </Link>
  );
}

const sessions = [
  { name: "Deep Tissue Massage", duration: "60 min", price: "$120", description: "Targeted tension relief" },
  { name: "Relaxation Massage", duration: "60 min", price: "$100", description: "Restore your balance" },
  { name: "Restorative Facial", duration: "45 min", price: "$85", description: "A refreshing reset" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900" style={{ colorScheme: "light" }}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            Aura Wellness <span className="font-normal text-slate-500">/ Booking</span>
          </Link>
          <Suspense fallback={<div className="h-10 w-36 animate-pulse rounded-lg bg-slate-100" />}>
            <UserSessionActions />
          </Suspense>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-teal-700">Wellness, within reach</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Book wellness sessions in minutes.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Secure your next massage, consultation, or wellness checkup with a simple,
            modern booking experience built for busy clients.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Suspense fallback={<div className="h-12 w-48 animate-pulse rounded-lg bg-slate-200" />}>
              <UserBookingCTA />
            </Suspense>
            <Link
              href="#today"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View available sessions
            </Link>
          </div>
        </section>

        <section
          id="today"
          aria-labelledby="today-heading"
          className="mx-auto mt-14 max-w-3xl scroll-mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 id="today-heading" className="font-semibold text-slate-900">
                Available services
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose a treatment to see appointment times.
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              Open for bookings
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {sessions.map((service) => (
              <Link
                key={service.name}
                href={`/book?service=${encodeURIComponent(service.name)}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{service.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{service.duration} · {service.description}</p>
                </div>
                <span className="flex shrink-0 items-center gap-3 text-sm font-medium text-teal-700">
                  {service.price} <span>Book →</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
