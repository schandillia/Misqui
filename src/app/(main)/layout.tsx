import { MobileHeader } from "@/components/mobile-header"
import { Sidebar } from "@/components/sidebar"

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <MobileHeader />
      <Sidebar className="hidden lg:flex" />
      <main className="h-full pt-[50px] lg:pt-0 lg:pl-[256px]">
        <div className="mx-auto h-full max-w-[1056px] pt-6 bg-neutral-50 dark:bg-neutral-900">
          {children}
        </div>
      </main>
    </>
  )
}
export default Layout
