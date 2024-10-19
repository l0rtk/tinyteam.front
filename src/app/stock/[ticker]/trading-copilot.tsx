"use client";

import { useParams } from "next/navigation";

export default function StockDetail() {
  const { ticker } = useParams();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {ticker} copilot
    </div>
  );
}
