"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function PickemError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Pick'em error boundary caught error:", error);
  }, [error]);

  return (
    <ErrorState
      title="Unable to load Pick'em"
      message="We ran into a problem loading the Match Pick'em challenge game. Please try again shortly."
      reset={reset}
    />
  );
}
