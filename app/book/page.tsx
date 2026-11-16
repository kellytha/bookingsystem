import { Suspense } from "react";
import { BookingWizard } from "./booking-wizard";

async function BookingContent({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const { service } = await searchParams;
  const initialService = Array.isArray(service) ? service[0] : service;
  return <BookingWizard initialService={initialService} />;
}

export default function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-slate-100" />}>
      <BookingContent searchParams={searchParams} />
    </Suspense>
  );
}
