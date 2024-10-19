"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const blinkAnimation = `
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
`;

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
  const [filteredPosts, setFilteredPosts] = useState<RedditPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [subredditFilter, setSubredditFilter] = useState("all");

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

  useEffect(() => {
    let result = posts;

    if (searchTerm) {
      result = result.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sentimentFilter !== "all") {
      result = result.filter(
        (post) => post.sentiment_label === sentimentFilter
      );
    }

    if (subredditFilter !== "all") {
      result = result.filter((post) => post.subreddit === subredditFilter);
    }

    setFilteredPosts(result);
  }, [posts, searchTerm, sentimentFilter, subredditFilter]);

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

  const uniqueSubreddits = Array.from(
    new Set(posts.map((post) => post.subreddit))
  );

  const ticker = Array.isArray(params.ticker)
    ? params.ticker[0]
    : params.ticker;

  return (
    <Card className="w-full h-[calc(100vh-4rem)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reddit Live Mentions for {ticker}</CardTitle>
        <div className="flex items-center">
          <span
            className="text-xs font-bold text-red-500 mr-2"
            style={{
              animation: "blink 1.5s linear infinite",
            }}
          >
            ●
          </span>
          <span className="text-sm font-semibold">LIVE</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="sentiment">Sentiment</Label>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger id="sentiment">
                <SelectValue placeholder="Filter by sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subreddit">Subreddit</Label>
            <Select value={subredditFilter} onValueChange={setSubredditFilter}>
              <SelectTrigger id="subreddit">
                <SelectValue placeholder="Filter by subreddit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueSubreddits.map((subreddit) => (
                  <SelectItem key={subreddit} value={subreddit}>
                    {subreddit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {filteredPosts.map((post) => (
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
      <style jsx>{blinkAnimation}</style>
    </Card>
  );
}
