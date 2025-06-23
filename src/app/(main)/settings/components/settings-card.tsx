// components/settings-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SettingsCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export const SettingsCard = ({
  title,
  children,
  className,
}: SettingsCardProps) => {
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
