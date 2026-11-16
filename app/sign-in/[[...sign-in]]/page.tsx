import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthShell } from "../../auth-shell";

export default function SignInPage() {
  return (
    <AuthShell caption="A calmer day is just one appointment away.">
      <Suspense fallback={<div className="h-[390px] animate-pulse rounded-md bg-slate-100" />}>
        <SignIn
          appearance={{
            options: {
              elevation: "flush",
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton",
            },
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none",
              card: "w-full border-0 p-0 shadow-none",
              headerTitle: "text-xl font-semibold",
              headerSubtitle: "text-xs",
              socialButtonsBlockButton: "border-slate-200 text-slate-800",
              formFieldLabel: "text-[11px] font-medium text-slate-700",
              formFieldInput: "h-10 border-slate-200 text-xs",
              formButtonPrimary: "h-10 bg-slate-900 text-xs hover:bg-slate-800",
              footerActionLink: "font-semibold text-slate-900",
            },
          }}
        />
      </Suspense>
    </AuthShell>
  );
}
