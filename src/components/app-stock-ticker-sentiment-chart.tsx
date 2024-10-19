"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import axios from "axios";

interface SentimentData {
  time_unit: string;
  positives: number;
  negatives: number;
  neutrals: number;
}

const tickerKeywords: { [key: string]: string[] } = {
  NVDA: ["nvidia", "nvda"],
  TSLA: ["tesla", "tsla"],
  AAPL: ["apple", "aapl"],
};

export function SentimentChartComponent() {
  const params = useParams();
  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const ticker = Array.isArray(params.ticker) ? params.ticker[0] : params.ticker;
      if (!ticker) {
        setError("No ticker provided");
        setLoading(false);
        return;
      }

      const keywords = tickerKeywords[ticker.toUpperCase()]?.join(",") || ticker;

      try {
        const response = await axios.get<SentimentData[]>(
          `http://localhost:8000/sentiments/sentiment_aggregation?keywords=${encodeURIComponent(keywords)}&aggregation_type=hourly`
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch sentiment data");
        setLoading(false);
      }
    };

    fetchData();
  }, [params.ticker]);

  if (loading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <p>Loading sentiment data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            positives: {
              label: "Positive",
              color: "hsl(var(--chart-1))",
            },
            negatives: {
              label: "Negative",
              color: "hsl(var(--chart-2))",
            },
            neutrals: {
              label: "Neutral",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time_unit"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="positives" stroke="var(--color-positives)" name="Positive" />
              <Line type="monotone" dataKey="negatives" stroke="var(--color-negatives)" name="Negative" />
              <Line type="monotone" dataKey="neutrals" stroke="var(--color-neutrals)" name="Neutral" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}