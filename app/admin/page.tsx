import { Suspense } from "react";
import { hasAdminAccess } from "../lib/admin-access";
import { AdminAccessDenied } from "./access-denied";
import { OwnerDashboard } from "./owner-dashboard";

async function AdminDashboard() {
  if (!(await hasAdminAccess())) return <AdminAccessDenied />;

  return <OwnerDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-slate-100" />}>
      <AdminDashboard />
    </Suspense>
  );
}
