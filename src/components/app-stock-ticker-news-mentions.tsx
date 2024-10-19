'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NewsMentionsComponent() {
  const dummyNews = [
    { id: 1, title: "Stock Market Soars", source: "Financial Times" },
    { id: 2, title: "Tech Stocks Rally", source: "Wall Street Journal" },
    { id: 3, title: "Earnings Report Surprises Investors", source: "CNBC" },
    { id: 4, title: "New Product Announcement", source: "TechCrunch" },
    { id: 5, title: "Market Analysis", source: "Bloomberg" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {dummyNews.map((news) => (
            <li key={news.id} className="border-b pb-2 last:border-b-0">
              <h3 className="font-semibold">{news.title}</h3>
              <p className="text-sm text-muted-foreground">{news.source}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}