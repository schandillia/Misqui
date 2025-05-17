import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetDescription,
} from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { Menu } from "lucide-react"
import brand from "@/lib/data/brand.json"
import Image from "next/image"

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer">
        <Menu className="text-white" />
      </SheetTrigger>
      <SheetContent side="left" className="z-100 p-0">
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center gap-x-3 pl-4">
              <Image
                src="/images/mascots/mascot.svg"
                alt="Mascot"
                width={25}
                height={25}
                className="align-middle"
              />
              <h1 className="text-brand-500 text-2xl font-extrabold tracking-wide">
                {brand.BRAND}
              </h1>
            </div>
          </SheetTitle>
          <SheetDescription>
            Practice every day, unlock new skills, and watch your brain grow
            stronger—Misqui makes learning an adventure!
          </SheetDescription>
        </SheetHeader>
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}
