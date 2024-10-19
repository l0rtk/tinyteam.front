"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RedditPost {
  _id: string;
  keyword: string;
  title: string;
  url: string;
  created_utc: string;
  subreddit: string;
  sentiment_label: string;
  sentiment_score: number;
}

const tickerKeywords: { [key: string]: string[] } = {
  NVDA: ["nvidia", "nvda"],
  TSLA: ["tesla", "tsla"],
  AAPL: ["apple", "aapl"],
};

export default function RedditMentions() {
  const params = useParams();
  const [posts, setPosts] = useState<RedditPost[]>([]);

  useEffect(() => {
    const ticker = Array.isArray(params.ticker)
      ? params.ticker[0]
      : params.ticker;

    if (!ticker) {
      console.error("No ticker provided");
      return;
    }

    const keywords = tickerKeywords[ticker.toUpperCase()]?.join(",") || ticker;

    const ws = new WebSocket(
      `ws://localhost:8000/posts/ws/keyword_posts?keywords=${encodeURIComponent(
        keywords.toLowerCase()
      )}`
    );

    ws.onmessage = (event) => {
      const newPosts = JSON.parse(event.data);
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    };

    return () => {
      ws.close();
    };
  }, [params.ticker]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500";
      case "negative":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ticker = Array.isArray(params.ticker)
    ? params.ticker[0]
    : params.ticker;

  return (
    <Card className="w-full h-[calc(100vh-4rem)]">
      <CardHeader>
        <CardTitle>Reddit Mentions for {ticker}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {posts.map((post) => (
            <Card key={post._id} className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <Badge
                    variant="outline"
                    className={getSentimentColor(post.sentiment_label)}
                  >
                    {post.sentiment_label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  r/{post.subreddit} • {formatDate(post.created_utc)}
                </p>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on Reddit
                </a>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
