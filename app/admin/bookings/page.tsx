import { Suspense } from "react";
import { hasAdminAccess } from "../../lib/admin-access";
import { AdminAccessDenied } from "../access-denied";
import { BookingRequestsDashboard } from "./booking-requests-dashboard";

async function BookingRequestsPage() {
  if (!(await hasAdminAccess())) return <AdminAccessDenied />;

  return <BookingRequestsDashboard />;
}

export default function BookingRequestsRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-slate-100" />}>
      <BookingRequestsPage />
    </Suspense>
  );
}
