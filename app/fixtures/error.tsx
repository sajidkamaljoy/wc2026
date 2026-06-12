"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function FixturesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fixtures error boundary caught error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Unable to load fixtures"
      message="We ran into a problem fetching the World Cup match schedule. Please try refreshing or checking back shortly."
      reset={reset}
    />
  );
}
