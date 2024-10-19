"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  specify?: boolean;
}

interface ApiResponse {
  id: string;
  action?: string;
  target?: string;
  condition?: string;
  quantity?: string;
  timeFrame?: string;
  specify: boolean;
  message: string;
}

interface Job {
  id: string;
  action: string;
  target: string;
  condition: string;
  quantity: string;
  timeFrame: string;
  status: string;
  createdAt: string;
}

export default function TradingCopilot() {
  const { ticker } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/llm/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          messages: [userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server");
      }

      const data = await response.json();
      const parsedResponse: ApiResponse =
        typeof data.response === "string"
          ? JSON.parse(data.response)
          : data.response;

      const assistantMessage: Message = {
        role: "assistant",
        content: parsedResponse.message,
        specify: parsedResponse.specify,
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      if (!parsedResponse.specify) {
        const newJob: Job = {
          id: parsedResponse.id,
          action: parsedResponse.action || "",
          target: parsedResponse.target || "",
          condition: parsedResponse.condition || "",
          quantity: parsedResponse.quantity || "",
          timeFrame: parsedResponse.timeFrame || "",
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        setJobs((prevJobs) => [...prevJobs, newJob]);
        console.log("Job created:", newJob);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <Card className="max-w-[1200px] mx-auto">
        <CardHeader>
          <CardTitle>{ticker} Trading Copilot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Chat</h2>
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px] mb-4" ref={scrollAreaRef}>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-2 p-2 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : message.specify
                            ? "bg-secondary Text-white"
                            : "Text-white"
                        } max-w-[80%] ${
                          message.role === "user" ? "ml-auto" : "mr-auto"
                        }`}
                      >
                        {message.content}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="bg-secondary p-2 rounded-lg max-w-[80%] mr-auto">
                        Thinking...
                      </div>
                    )}
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder={`Ask about ${ticker} stock...`}
                      disabled={isLoading}
                    />
                    <Button onClick={sendMessage} disabled={isLoading}>
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Jobs</h2>
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[460px]">
                    {jobs.length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          No jobs created yet.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      jobs.map((job) => (
                        <Card key={job.id} className="mb-4">
                          <CardContent className="pt-4">
                            <div className="m-3 flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">
                                {job.id}
                              </h3>
                              <Badge
                                variant={
                                  job.status === "pending"
                                    ? "secondary"
                                    : "default"
                                }
                              >
                                {job.status}
                              </Badge>
                            </div>
                            <p className="m-3">
                              <strong>Action:</strong>{" "}
                              <Button
                                className={`text-sm px-4 py-1 min-w-[50px] ${
                                  job.action.toLowerCase() === "sell"
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-green-500 hover:bg-green-600"
                                }`}
                              >
                                {job.action}
                              </Button>
                            </p>
                            <p className="m-3">
                              <strong>Target:</strong> {job.target}
                            </p>
                            <p className="m-3">
                              <strong>Condition:</strong> {job.condition}
                            </p>
                            <p className="m-3">
                              <strong>Quantity:</strong> {job.quantity}
                            </p>
                            <p className="m-3">
                              <strong>Time Frame:</strong> {job.timeFrame}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Created:{" "}
                              {new Date(job.createdAt).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
