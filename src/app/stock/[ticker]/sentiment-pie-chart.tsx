"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

interface SentimentData {
  positives: number;
  negatives: number;
  neutrals: number;
}

const tickerKeywords: { [key: string]: string[] } = {
  NVDA: ["nvidia", "nvda"],
  TSLA: ["tesla", "tsla"],
  AAPL: ["apple", "aapl"],
};

const timeRanges = [
  { label: "Last 30 minutes", value: "30m" },
  { label: "Last 1 hour", value: "1h" },
  { label: "Last 6 hours", value: "6h" },
  { label: "Last 12 hours", value: "12h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
];

export default function SentimentPieChart() {
  const params = useParams();
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("1h");

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
        const response = await axios.get<SentimentData>(
          `http://13.60.224.198:8000/sentiments/sentiment_pie_chart?keywords=${encodeURIComponent(
            keywords
          )}&aggregation_type=minutes&start_time=${getStartTime(timeRange)}`
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
  }, [params.ticker, timeRange]);

  const getStartTime = (range: string) => {
    const now = new Date();
    switch (range) {
      case "30m":
        return new Date(now.getTime() - 30 * 60000).toISOString();
      case "1h":
        return new Date(now.getTime() - 60 * 60000).toISOString();
      case "6h":
        return new Date(now.getTime() - 6 * 60 * 60000).toISOString();
      case "12h":
        return new Date(now.getTime() - 12 * 60 * 60000).toISOString();
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60000).toISOString();
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60000).toISOString();
      default:
        return new Date(now.getTime() - 60 * 60000).toISOString();
    }
  };

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

  const chartData = data
    ? [
        { name: "Positive", value: data.positives },
        { name: "Negative", value: data.negatives },
        { name: "Neutral", value: data.neutrals },
      ]
    : [];

  const COLORS = [
    "hsl(142, 76%, 36%)",
    "hsl(var(--destructive))",
    "hsl(var(--chart-3))",
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sentiment Distribution</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            positives: { label: "Positive", color: COLORS[0] },
            negatives: { label: "Negative", color: COLORS[1] },
            neutrals: { label: "Neutral", color: COLORS[2] },
          }}
        >
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={200}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
