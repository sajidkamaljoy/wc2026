"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global boundary caught error:", error);
  }, [error]);

  return <ErrorState reset={reset} />;
}
