"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  role: "user" | "assistant";
  content: string;
  specify?: boolean;
}

interface ApiResponse {
  id: string;
  specify: boolean;
  message: string;
}

export function Page() {
  const { ticker } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [specifyResponse, setSpecifyResponse] = useState<ApiResponse | null>(
    null
  );
  const [jobCreated, setJobCreated] = useState(false);
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
    setJobCreated(false);

    try {
      const response = await fetch("http://13.60.224.198:8000/llm/chat/", {
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
      const parsedResponse: ApiResponse = JSON.parse(data.response);

      const assistantMessage: Message = {
        role: "assistant",
        content: parsedResponse.message,
        specify: parsedResponse.specify,
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      console.log(parsedResponse);
      if (parsedResponse.id === "specify_needed" && parsedResponse.specify) {
        setSpecifyResponse(parsedResponse);
      } else {
        setSpecifyResponse(null);
        if (parsedResponse.specify === false) {
          setJobCreated(true);
          console.log("Response:", parsedResponse);
        }
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{ticker} Trading Copilot</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] mb-4" ref={scrollAreaRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : message.specify === false
                    ? "bg-green-500 text-white"
                    : "bg-secondary"
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
          {jobCreated && (
            <Alert className="mb-4">
              <AlertDescription>Job is created!</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder={
                specifyResponse
                  ? "Please provide more details..."
                  : `Ask about ${ticker} stock...`
              }
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
