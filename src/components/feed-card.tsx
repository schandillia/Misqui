// components/feed-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FeedCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export const FeedCard = ({ title, children, className }: FeedCardProps) => {
  return (
    <Card className={cn("dark:bg-black", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
