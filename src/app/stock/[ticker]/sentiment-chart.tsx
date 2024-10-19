"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function SentimentChartComponent() {
  const params = useParams();
  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeGranularity, setTimeGranularity] = useState<"hourly" | "minutes">(
    "hourly"
  );

  useEffect(() => {
    const fetchData = async () => {
      const ticker = Array.isArray(params.ticker)
        ? params.ticker[0]
        : params.ticker;
      if (!ticker) {
        setError("No ticker provided");
        setLoading(false);
        return;
      }

      const keywords =
        tickerKeywords[ticker.toUpperCase()]?.join(",") || ticker;

      try {
        const response = await axios.get<SentimentData[]>(
          `http://13.60.224.198:8000/sentiments/sentiment_aggregation?keywords=${encodeURIComponent(
            keywords
          )}&aggregation_type=${timeGranularity}`
        );
        setData(response.data);
        setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Failed to fetch sentiment data");
        setLoading(false);
      }
    };

    fetchData();
  }, [params.ticker, timeGranularity]);

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
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sentiment Analysis</h2>
        <Select
          value={timeGranularity}
          onValueChange={(value: "hourly" | "minutes") =>
            setTimeGranularity(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time granularity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="minutes">Minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="w-full h-[calc(100%-2rem)]">
        <CardContent>
          <ChartContainer
            config={{
              positives: {
                label: "Positive",
                color: "hsl(142, 76%, 36%)", // A vibrant green color
              },
              negatives: {
                label: "Negative",
                color: "hsl(var(--destructive))",
              },
              neutrals: {
                label: "Neutral",
                color: "hsl(var(--chart-3))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time_unit"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString()
                  }
                />
                <YAxis domain={["auto", "auto"]} allowDataOverflow={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="positives"
                  stroke="hsl(142, 76%, 36%)" // Use the same green color directly
                  strokeWidth={2}
                  strokeOpacity={0.8}
                  dot={{
                    fill: "hsl(142, 76%, 36%)",
                    stroke: "hsl(142, 76%, 36%)",
                    r: 4,
                  }}
                  name="Positive"
                />
                <Line
                  type="monotone"
                  dataKey="negatives"
                  stroke="var(--color-negatives)"
                  strokeWidth={2}
                  strokeOpacity={0.8}
                  dot={{
                    fill: "var(--color-negatives)",
                    stroke: "var(--color-negatives)",
                    r: 4,
                  }}
                  name="Negative"
                />
                <Line
                  type="monotone"
                  dataKey="neutrals"
                  stroke="var(--color-neutrals)"
                  strokeWidth={2}
                  strokeOpacity={0.8}
                  dot={{
                    fill: "var(--color-neutrals)",
                    stroke: "var(--color-neutrals)",
                    r: 4,
                  }}
                  name="Neutral"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
