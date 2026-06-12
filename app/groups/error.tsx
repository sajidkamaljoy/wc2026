"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function GroupsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Groups error boundary caught error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Unable to load standings"
      message="We encountered an issue calculating the group stage standings. Please retry to refresh the live tables."
      reset={reset}
    />
  );
}
