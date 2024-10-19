"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function StockDetail() {
  const { ticker } = useParams();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4">
      <Link href="/" className="text-primary hover:underline mb-4 self-start">
        &larr; Back to Dashboard
      </Link>
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <h1 className="text-4xl font-bold text-primary">{ticker}</h1>
        </CardContent>
      </Card>
    </div>
  );
}
