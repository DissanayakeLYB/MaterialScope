import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

// Reads the auth session, so it must render per request.
export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const user = await getCurrentUser();
  if (user) redirect("/profile");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-16">
      {/* Suspense keeps useSearchParams() (error param) SSR-friendly. */}
      <Suspense>
        <AuthForm />
      </Suspense>
    </main>
  );
}
