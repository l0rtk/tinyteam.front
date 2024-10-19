"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
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

interface NewsArticle {
  id: string;
  ticker: string[];
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
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
      ws.send("Request update"); // Send any message to request an update
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
    }, 60000); // Request updates every minute

    return () => {
      clearInterval(intervalId);
      ws.close();
    };
  }, [ticker, searchParams]);

  const openArticleModal = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const renderNewsArticles = () => {
    if (isLoading) {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <li key={index} className="border-b pb-4 last:border-b-0">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full" />
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
      <li key={article.id} className="border-b pb-4 last:border-b-0">
        <h3 className="font-semibold text-lg">
          <Button
            variant="link"
            className="p-0 h-auto font-semibold text-lg text-left"
            onClick={() => openArticleModal(article)}
          >
            {article.title}
          </Button>
        </h3>
        <p className="text-sm text-muted-foreground">
          {article.source} -{" "}
          {new Date(article.publishedAt).toLocaleDateString()}
        </p>
        <p className="text-sm mt-2">{article.description}</p>
      </li>
    ));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <Card className="w-full mb-4">
          <CardContent className="flex items-center justify-between p-6">
            <h1 className="text-3xl font-bold text-primary">Latest News</h1>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ul className="space-y-4">{renderNewsArticles()}</ul>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            <DialogDescription>
              {selectedArticle?.source} -{" "}
              {selectedArticle &&
                new Date(selectedArticle.publishedAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              <p>{selectedArticle?.description}</p>
              <a
                href={selectedArticle?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Read full article
              </a>
              <h4 className="font-semibold">Insights:</h4>
              {selectedArticle &&
                Object.entries(selectedArticle.insights).map(
                  ([ticker, insight]) => (
                    <div key={ticker} className="border-t pt-2">
                      <h5 className="font-medium">{ticker}</h5>
                      <p>Sentiment: {insight.sentiment}</p>
                      <p>Reasoning: {insight.reasoning}</p>
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
