import Link from "next/link";

export function AdminAccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 text-slate-900">
      <section className="max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-teal-700">Aura Wellness</p>
        <h1 className="mt-2 text-2xl font-semibold">Admin access required</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          You’re signed in, but this account doesn’t have the admin role. An
          administrator can grant access by setting this account’s Clerk public
          metadata role to <code>admin</code> or <code>super_admin</code>.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Return to Aura Wellness
        </Link>
      </section>
    </main>
  );
}
