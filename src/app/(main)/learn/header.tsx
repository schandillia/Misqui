import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

type Props = {
  title: string
}

export const Header = ({ title }: Props) => {
  return (
    <div className="bg-white dark:bg-black sticky top-0 pb-3 lg:mt-[-28px] lg:pt-[28px] flex items-center justify-between border-b-2 mb-5 text-neutral-400 lg:z-50">
      <Link href="/courses">
        <Button size="sm" variant="ghost">
          <ArrowLeft className="size-5 stroke-2 text-neutral-400" />
        </Button>
      </Link>
      <h1 className="font-bold text-lg">{title}</h1>
      <div />
    </div>
  )
}
