"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import RedditMentions from "./reddit-mentions";
import SentimentChart from "./sentiment-chart";

export default function StockDetail() {
  const { ticker } = useParams();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <Link
          href="/"
          className="text-primary hover:underline mb-4 inline-block"
        >
          &larr; Back to Comparison
        </Link>
        <Card className="w-full mb-4">
          <CardContent className="flex items-center justify-center p-6">
            <h1 className="text-4xl font-bold text-primary">{ticker}</h1>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SentimentChart />
          <RedditMentions />
        </div>
      </div>
    </div>
  );
}
