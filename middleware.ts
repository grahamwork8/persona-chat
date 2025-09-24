// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", // all pages except static files
    "/",                      // root
    "/(api|trpc)(.*)"         // all API routes
  ]
};

