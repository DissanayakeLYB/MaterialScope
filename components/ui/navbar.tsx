import { NavbarClient, type NavbarUser } from "@/components/ui/navbar-client";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Server wrapper around the client navbar: resolves the signed-in user (if
 * any) on the server so the header renders the right auth state on first
 * paint, then hands it to the interactive client nav.
 */
export async function Navbar() {
  const user = await getCurrentUser();

  const navUser: NavbarUser | null = user
    ? {
        email: user.email ?? "",
        displayName: user.user_metadata?.full_name ?? user.email ?? null,
      }
    : null;

  return <NavbarClient user={navUser} />;
}
