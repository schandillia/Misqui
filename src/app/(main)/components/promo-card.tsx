import Image from "next/image"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { SidebarCard } from "@/components/sidebar-card"
import { SubscriptionButton } from "@/components/subscription-button"

export const PromoCard = () => {
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
      <SubscriptionButton
        isPro={false}
        size="lg"
        className="w-full"
        nonProVariant="super"
        nonProLabel="Upgrade today"
      />
    </SidebarCard>
  )
}
