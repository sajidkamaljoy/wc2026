"use client";

import { usePathname } from "next/navigation";

/**
 * Re-mounts children on every navigation by using the pathname as the key.
 * This is required so the fade-in animation fires correctly on each page
 * transition, instead of only on the initial app mount.
 */
export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
