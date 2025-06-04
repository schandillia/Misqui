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
      <main className="h-full lg:pl-[256px]">
        <div className="mx-auto h-full max-w-[1056px]">{children}</div>
      </main>
    </>
  )
}
export default Layout
