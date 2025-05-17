import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export const Promo = () => {
  return (
    <div className="space-y-4 rounded-3xl border-2 p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image
            src="/images/icons/gems_unlimited.svg"
            alt="Pro"
            height={26}
            width={26}
          />
          <h3 className="text-lg font-bold dark:text-neutral-300">
            Upgrade to Pro
          </h3>
        </div>
        <p className="text-muted-foreground">Get unlimited gems and more!</p>
      </div>

      <Button className="w-full" size="lg" variant="super" asChild>
        <Link href="/store">Upgrade today</Link>
      </Button>
    </div>
  )
}
