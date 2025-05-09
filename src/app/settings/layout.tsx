import type { Metadata } from "next"
import meta from "@/lib/data/meta.json"

export const metadata: Metadata = {
  title: meta.SETTINGS.TITLE,
  description: meta.SETTINGS.DESCRIPTION,
}

type Props = {
    children: React.ReactNode
  }
  
const Layout = ({ children }: Props) => {
    return (
        <div className="h-full flex flex-con">
        <div className="flex flex-col h-full w-full">{children}</div>
        </div>
    )
}
export default Layout