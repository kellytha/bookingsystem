import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  caption: string;
};

export function AuthShell({ children, caption }: AuthShellProps) {
  return (
    <main
      className="flex min-h-screen flex-col bg-[#f7f8fa] text-slate-900"
      style={{ colorScheme: "light" }}
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[82px] max-w-[944px] items-center justify-between px-6">
          <Link href="/" aria-label="Aura Wellness home" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-700 text-sm text-slate-700">
              ◉
            </span>
            <span className="leading-none">
              <span className="block text-lg font-semibold tracking-tight">aura</span>
              <span className="mt-1 block text-[8px] font-medium tracking-[0.32em] text-slate-500">
                WELLNESS
              </span>
            </span>
          </Link>
          <Link href="/" className="text-xs font-medium text-slate-500 hover:text-slate-900">
            ← &nbsp;Back to booking
          </Link>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center px-5 pb-12 pt-14">
        <div className="w-full max-w-[420px] rounded-lg border border-slate-200 bg-white px-6 py-7 sm:px-7">
          {children}
          <p className="mt-5 text-center text-[11px] text-slate-500">
            <span aria-hidden="true">♙</span> &nbsp;Secured by Clerk
          </p>
        </div>
        <p className="mt-5 text-center text-xs text-slate-500">{caption}</p>
      </section>

      <footer className="mx-auto flex w-full max-w-[944px] items-center justify-between px-6 pb-6 text-[10px] text-slate-500">
        <span>© 2026 Aura Wellness</span>
        <nav aria-label="Legal and help" className="flex gap-7">
          <Link href="/" className="hover:text-slate-900">Privacy</Link>
          <Link href="/" className="hover:text-slate-900">Terms</Link>
          <Link href="/" className="hover:text-slate-900">Help</Link>
        </nav>
      </footer>
    </main>
  );
}
