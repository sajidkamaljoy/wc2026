"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function BracketError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Bracket error boundary caught error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Unable to load bracket"
      message="We encountered an issue rendering the tournament knockout bracket pathway. Please try reloading."
      reset={reset}
    />
  );
}
