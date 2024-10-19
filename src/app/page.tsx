"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface StockDetails {
  ticker: string;
  name: string;
  market_cap: number;
  total_employees: number;
  currency_name: string;
}

export default function StockComparison() {
  const [stocks, setStocks] = useState<StockDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const tickers = ["TSLA", "NVDA", "AAPL"];
        const stockData = await Promise.all(
          tickers.map((ticker) =>
            axios
              .get<{ results: StockDetails }>(
                `http://localhost:8000/tickers/stock_details/${ticker}`
              )
              .then((response) => response.data.results)
          )
        );
        setStocks(stockData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toFixed(2)}`;
  };

  const formatEmployees = (employees: number) => {
    return employees.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Stock Comparison
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? Array(3)
                .fill(null)
                .map((_, index) => (
                  <Card key={index} className="w-full">
                    <CardHeader>
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))
            : stocks.map((stock) => (
                <Link href={`/stock/${stock.ticker}`} key={stock.ticker}>
                  <Card className="w-full relative hover:shadow-lg transition-shadow duration-300">
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-md flex items-center justify-center">
                      <Image
                        src={`/logos/${stock.ticker}.png`}
                        alt={`${stock.name} logo`}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{stock.ticker}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {stock.name}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-primary">
                            Market Cap
                          </h3>
                          <p>{formatMarketCap(stock.market_cap)}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary">
                            Employees
                          </h3>
                          <p>{formatEmployees(stock.total_employees)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}
