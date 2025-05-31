import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

type SidebarCardProps = ComponentProps<typeof Card>

export function SidebarCard({
  className,
  children,
  ...props
}: SidebarCardProps) {
  return (
    <Card
      className={cn(
        "border-1 p-4 shadow-lg shadow-neutral-300 dark:border-2 dark:shadow-neutral-800",
        className
      )}
      {...props}
    >
      <CardContent className="space-y-2 p-0">{children}</CardContent>
    </Card>
  )
}
