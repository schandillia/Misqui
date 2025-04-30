import Link from "next/link"

type Props = {
  children: React.ReactNode
}

export const StickyWrapper = ({ children }: Props) => {
  return (
    <div className="hidden lg:block w-[368px] sticky self-end bottom-6">
      <div className="min-h-[calc(100vh-48px)] sticky top-6 flex flex-col justify-between">
        <div className="flex flex-col gap-y-4">{children}</div>
        <div className="uppercase pt-6 text-xs font-bold text-muted-foreground flex flex-wrap justify-between gap-x-4 gap-y-2 border-t border-neutral-200 dark:border-neutral-800 mt-6 px-2">
          <Link href="/about" className="hover:underline whitespace-nowrap">
            About
          </Link>
          <Link href="/store" className="hover:underline whitespace-nowrap">
            Store
          </Link>
          <Link href="/efficacy" className="hover:underline whitespace-nowrap">
            Efficacy
          </Link>
          <Link href="/terms" className="hover:underline whitespace-nowrap">
            Terms
          </Link>
          <Link href="/privacy" className="hover:underline whitespace-nowrap">
            Privacy
          </Link>
        </div>
      </div>
    </div>
  )
}
