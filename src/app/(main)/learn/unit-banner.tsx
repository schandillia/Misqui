import { Button } from "@/components/ui/button"
import { NotebookText } from "lucide-react"
import Link from "next/link"

type Props = {
  title: string
  description: string
}

export const UnitBanner = ({ title, description }: Props) => {
  return (
    <div className="w-full rounded-2xl bg-brand-500 dark:bg-brand-800 p-5 text-white dark:text-neutral-300 flex items-center justify-between">
      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
      <Link href="/lesson">
        <Button size="lg" variant="secondary" className="hidden lg:flex">
          <NotebookText className="mr-2" />
          Continue
        </Button>
      </Link>
    </div>
  )
}
