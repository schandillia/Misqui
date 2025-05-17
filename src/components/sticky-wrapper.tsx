import Link from "next/link"

type Props = {
  children: React.ReactNode
}

export const StickyWrapper = ({ children }: Props) => {
  return (
    <div className="sticky bottom-6 hidden w-[368px] self-end lg:block">
      <div className="sticky top-6 flex min-h-[calc(100vh-48px)] flex-col justify-between">
        <div className="flex flex-col gap-y-4">{children}</div>
        <div className="text-muted-foreground mt-6 flex flex-wrap justify-between gap-x-4 gap-y-2 border-t border-neutral-200 px-2 pt-6 text-xs font-bold uppercase dark:border-neutral-800">
          <Link href="/about" className="whitespace-nowrap hover:underline">
            About
          </Link>
          <Link href="/store" className="whitespace-nowrap hover:underline">
            Store
          </Link>
          <Link href="/efficacy" className="whitespace-nowrap hover:underline">
            Efficacy
          </Link>
          <Link href="/terms" className="whitespace-nowrap hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="whitespace-nowrap hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </div>
  )
}
