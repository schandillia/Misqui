import { Metadata } from "next"
import meta from "@/lib/data/meta.json"
import type { ReactNode } from "react"

// Route params type - now a Promise
type Params = Promise<{
  courseId: string
  unitNumber: string
  drillNumber: string
}>

// Metadata generator
export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  // Await params before accessing properties
  const { unitNumber, drillNumber } = await params

  return {
    title: `Unit ${unitNumber} | Drill ${drillNumber}`,
    description: meta.DRILL.DESCRIPTION,
  }
}

// Layout component
const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="container mx-auto p-4">{children}</div>
}

export default Layout
