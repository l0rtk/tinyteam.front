"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import SentimentChart from "./sentiment-chart";
import SentimentPieChart from "./sentiment-pie-chart";
import RedditMentions from "./reddit-mentions";
import NewsPage from "./news-mentions";
import TradingCopilot from "./trading-copilot";

export default function StockDetail() {
  const { ticker } = useParams();
  const [activeTab, setActiveTab] = useState("reddit");

  const TabButton = ({
    tab,
    label,
    children,
  }: {
    tab: string;
    label: string;
    children?: React.ReactNode;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-t-lg ${
        activeTab === tab
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
      }`}
    >
      {children || label}
    </button>
  );

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
          <CardContent className="flex items-center justify-between p-6">
            <h1 className="text-4xl font-bold text-primary">{ticker}</h1>
            <div className="flex items-center space-x-4"></div>
          </CardContent>
        </Card>
        <div className="mb-4">
          <div className="flex space-x-2">
            <TabButton tab="reddit" label="Reddit" />
            <TabButton tab="news" label="News" />
            <TabButton tab="copilot" label="Trading Copilot">
              <div className="flex items-center space-x-2">
                <Image
                  src="/robot-icon.png"
                  alt="Trading Copilot Robot"
                  width={30}
                  height={30}
                />
                <span>Trading Copilot</span>
              </div>
            </TabButton>
          </div>
        </div>
        {activeTab === "reddit" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <SentimentChart />
              <SentimentPieChart />
            </div>
            <div className="lg:col-span-1">
              <RedditMentions />
            </div>
          </div>
        )}
        {activeTab === "news" && (
          <div>
            <NewsPage />
          </div>
        )}
        {activeTab === "copilot" && (
          <div>
            <TradingCopilot />
          </div>
        )}
      </div>
    </div>
  );
}
