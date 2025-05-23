import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { SidebarCard } from "@/components/sidebar-card"

export const Promo = () => {
  return (
    <SidebarCard>
      <div className="flex items-center gap-x-2">
        <div className="self-center">
          <Image
            src="/images/icons/gems_unlimited.svg"
            alt="Pro"
            height={26}
            width={26}
          />
        </div>
        <CardTitle className="text-lg font-bold dark:text-neutral-300">
          Upgrade to Pro
        </CardTitle>
      </div>
      <CardDescription className="text-muted-foreground text-base">
        Get unlimited gems and more!
      </CardDescription>
      <Button className="w-full" size="lg" variant="super" asChild>
        <Link href="/store">Upgrade today</Link>
      </Button>
    </SidebarCard>
  )
}
