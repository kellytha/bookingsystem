"use client";

import Link from "next/link";
import { useDemoBookings } from "../lib/demo-bookings";

export type AdminSection = "Schedule" | "Bookings" | "Services" | "Staff" | "Settings";

const navigation: { name: AdminSection; href: string; icon: string }[] = [
  { name: "Schedule", href: "/admin", icon: "▦" },
  { name: "Bookings", href: "/admin/bookings", icon: "▱" },
  { name: "Services", href: "/admin?section=Services", icon: "⊞" },
  { name: "Staff", href: "/admin?section=Staff", icon: "♙" },
  { name: "Settings", href: "/admin?section=Settings", icon: "⚙" },
];

export function AdminSidebar({ active }: { active: AdminSection }) {
  const { bookings, ready } = useDemoBookings();
  const pendingCount = bookings.filter((booking) => booking.status === "Pending").length;

  return (
    <aside className="flex shrink-0 flex-col border-b border-slate-200 bg-[#f0f1f4] md:min-h-screen md:w-44 md:border-b-0 md:border-r">
      <Link href="/" className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-700 text-xs">
          ◉
        </span>
        <span className="leading-none">
          <span className="block text-lg font-semibold">aura</span>
          <span className="mt-1 block text-[8px] tracking-[0.3em] text-slate-500">WELLNESS</span>
        </span>
      </Link>

      <div className="hidden px-3 md:block">
        <div className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span className="block text-xs font-semibold">Aura Studio</span>
          <span className="mt-1 block text-[10px] text-slate-500">Owner workspace</span>
        </div>
      </div>

      <p className="hidden px-5 pb-2 pt-6 text-[9px] font-medium uppercase tracking-wider text-slate-500 md:block">
        Workspace
      </p>
      <nav aria-label="Owner workspace" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
        {navigation.map((item) => (
          <Link
            href={item.href}
            key={item.name}
            aria-current={active === item.name ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition ${
              active === item.name
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:bg-white/70"
            }`}
          >
            <span className="mr-2 inline-block w-4 text-center text-slate-500" aria-hidden="true">
              {item.icon}
            </span>
            {item.name}
            {item.name === "Bookings" && (
              <span className="ml-3 rounded bg-slate-100 px-1.5 py-0.5 text-[9px]">
                {ready ? pendingCount : "…"}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto hidden px-3 pb-4 md:block">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-semibold">Your studio, online.</p>
          <p className="mt-1 text-[9px] text-slate-500">Share a little wellbeing.</p>
          <Link href="/book" className="mt-3 block text-[10px] font-medium text-slate-700 hover:text-teal-700">
            View booking page ↗
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[9px] font-semibold">
            SC
          </div>
          <div>
            <p className="text-[10px] font-medium">Sarah Chen</p>
            <p className="text-[9px] text-slate-500">Studio owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
