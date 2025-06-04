import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

type Props = {
  title: string
}

export const Header = ({ title }: Props) => {
  return (
    <div
      className="sticky top-0 mb-5 flex items-center justify-center border-b-2 pb-3
        text-neutral-400 lg:z-50 lg:mt-[-28px] lg:pt-[28px]"
    >
      <h1 className="text-lg font-bold">{title}</h1>
      <div />
    </div>
  )
}
