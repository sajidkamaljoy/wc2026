"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Team error boundary caught error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Unable to load team profile"
      message="We had trouble fetching the team details, squad information, or prediction pathway. Please try again."
      reset={reset}
    />
  );
}
