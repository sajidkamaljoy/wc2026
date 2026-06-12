"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function WatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Watch error boundary caught error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Unable to load stream"
      message="We had trouble retrieving the live match stream information. Please try reloading the player."
      reset={reset}
    />
  );
}
