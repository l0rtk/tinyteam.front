"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface NewsArticle {
  id: string;
  ticker: string[];
  title: string;
  description: string;
  url: string;
  published_utc: string;
  source: string;
  image_url: string;
  insights: {
    [key: string]: {
      sentiment: string;
      reasoning: string;
    };
  };
}

export default function NewsPage() {
  const { ticker } = useParams();
  const searchParams = useSearchParams();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const additionalTickers = searchParams.get("additionalTickers");
    const limit = searchParams.get("limit") || "100";
    const tickers = additionalTickers
      ? `${ticker},${additionalTickers}`
      : ticker;

    const wsUrl = `ws://localhost:8000/news/ws/ticker_news?tickers=${tickers}&limit=${limit}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      ws.send("Request update");
    };

    ws.onmessage = (event) => {
      const newArticles = JSON.parse(event.data);
      setNewsArticles((prevArticles) => {
        const uniqueArticles = newArticles.filter(
          (newArticle: NewsArticle) =>
            !prevArticles.some(
              (prevArticle) => prevArticle.id === newArticle.id
            )
        );
        setIsLoading(false);
        return [...uniqueArticles, ...prevArticles];
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsLoading(false);
    };

    const intervalId = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("Request update");
      }
    }, 60000);

    return () => {
      clearInterval(intervalId);
      ws.close();
    };
  }, [ticker, searchParams]);

  const openArticleModal = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src = "/placeholder.svg?height=96&width=96";
  };

  const getSentimentLabel = (sentiment: string) => {
    const sentimentLower = sentiment.toLowerCase();
    let icon, bgColor;

    switch (sentimentLower) {
      case "positive":
        icon = <ThumbsUp className="h-3 w-3" />;
        bgColor = "bg-green-500";
        break;
      case "negative":
        icon = <ThumbsDown className="h-3 w-3" />;
        bgColor = "bg-red-500";
        break;
      default:
        icon = <Minus className="h-3 w-3" />;
        bgColor = "bg-yellow-600";
    }

    return (
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${bgColor}`}
      >
        {icon}
        <span className="capitalize">{sentimentLower}</span>
      </div>
    );
  };

  const renderNewsArticles = () => {
    if (isLoading) {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <li
            key={index}
            className="border-b border-gray-700 pb-4 last:border-b-0 flex"
          >
            <Skeleton className="h-24 w-24 mr-4" />
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-6 w-20 ml-4" />
          </li>
        ));
    }

    if (newsArticles.length === 0) {
      return (
        <p className="text-center text-muted-foreground">
          No news articles available at the moment.
        </p>
      );
    }

    return newsArticles.map((article) => (
      <li
        key={article.id}
        className="border-b border-gray-700 pb-4 last:border-b-0 flex items-start"
      >
        <div className="mr-4 flex-shrink-0">
          <Image
            src={article.image_url || "/placeholder.svg?height=96&width=96"}
            alt={article.title}
            width={96}
            height={96}
            className="object-cover rounded"
            onError={handleImageError}
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">
              <Button
                variant="link"
                className="p-0 h-auto font-semibold text-lg text-left text-blue-400 hover:text-blue-300"
                onClick={() => openArticleModal(article)}
              >
                {article.title}
              </Button>
            </h3>
            {getSentimentLabel(
              article.insights[ticker]?.sentiment || "neutral"
            )}
          </div>
          <p className="text-sm text-gray-400">
            {article.source} - {formatRelativeTime(article.published_utc)}
          </p>
          <p className="text-sm mt-2 text-gray-300">{article.description}</p>
        </div>
      </li>
    ));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="container mx-auto p-4">
        <Card className="w-full mb-4 bg-[#1a1a1a] border-gray-700">
          <CardContent className="flex items-center justify-between p-6">
            <h1 className="text-3xl font-bold text-white">Latest News</h1>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-gray-700">
          <CardContent>
            <ul className="space-y-4">{renderNewsArticles()}</ul>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl bg-[#1a1a1a] text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedArticle?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedArticle?.source} -{" "}
              {selectedArticle &&
                formatRelativeTime(selectedArticle.published_utc)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              {selectedArticle && (
                <Image
                  src={
                    selectedArticle.image_url ||
                    "/placeholder.svg?height=200&width=400"
                  }
                  alt={selectedArticle.title}
                  width={400}
                  height={200}
                  className="object-cover rounded w-full"
                  onError={handleImageError}
                />
              )}
              <p className="text-gray-300">{selectedArticle?.description}</p>
              <a
                href={selectedArticle?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Read full article
              </a>
              <h4 className="font-semibold text-white">Insights:</h4>
              {selectedArticle &&
                Object.entries(selectedArticle.insights).map(
                  ([insightTicker, insight]) => (
                    <div
                      key={insightTicker}
                      className="border-t border-gray-700 pt-2"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-white">
                          {insightTicker}
                        </h5>
                        {getSentimentLabel(insight.sentiment)}
                      </div>
                      <p className="text-gray-300 mt-1">
                        Reasoning: {insight.reasoning}
                      </p>
                    </div>
                  )
                )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
