import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isSuperAdminRoute = createRouteMatcher(["/super-admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isAdminRoute(req) && !isSuperAdminRoute(req)) {
    return;
  }

  const { sessionClaims } = await auth();
  if (isAdminRoute(req)) {
    await auth.protect();
    return;
  }

  if (isSuperAdminRoute(req)) {
    await auth.protect();
    const claims = sessionClaims as
      | (Record<string, unknown> & {
          metadata?: { role?: string };
          publicMetadata?: { role?: string };
          public_metadata?: { role?: string };
        })
      | null;
    const role =
      claims?.metadata?.role ??
      claims?.publicMetadata?.role ??
      claims?.public_metadata?.role;
    if (role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
