import { MobileHeader } from "@/components/mobile-header"
import { Sidebar } from "@/components/sidebar"
import { auth } from "@/auth"

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const session = await auth()
  const showSidebar = !!session

  return (
    <>
      <MobileHeader />
      {showSidebar && <Sidebar className="hidden lg:flex" />}
      <main
        className={
          showSidebar
            ? "h-full lg:pl-[256px]"
            : "h-full bg-neutral-50 dark:bg-neutral-900"
        }
      >
        <div className="mx-auto h-full max-w-[1056px]">{children}</div>
      </main>
    </>
  )
}

export default Layout
