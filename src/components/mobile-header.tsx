import { MobileSidebar } from "@/components/mobile-sidebar"

export const MobileHeader = () => {
  return (
    <nav
      className="bg-brand-500 fixed top-0 z-50 flex h-[50px] w-full items-center border-b px-6
        lg:hidden"
    >
      <MobileSidebar />
    </nav>
  )
}
