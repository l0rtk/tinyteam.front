'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface RedditPost {
  _id: string
  keyword: string
  title: string
  url: string
  score: number
  num_comments: number
  created_utc: string
  subreddit: string
  sentiment_label: string
  sentiment_score: number
}

export function RedditMentionsComponent() {
  const { ticker } = useParams()
  const [posts, setPosts] = useState<RedditPost[]>([])

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/posts/ws/keyword_posts?keywords=${ticker}`)

    ws.onmessage = (event) => {
      const newPosts = JSON.parse(event.data)
      setPosts(prevPosts => [...prevPosts, ...newPosts])
    }

    return () => {
      ws.close()
    }
  }, [ticker])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500'
      case 'negative':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

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
                  <Badge variant="outline" className={getSentimentColor(post.sentiment_label)}>
                    {post.sentiment_label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  r/{post.subreddit} • Score: {post.score} • Comments: {post.num_comments}
                </p>
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View on Reddit
                </a>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}