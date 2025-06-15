import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Oops, this area is for grown-up helpers only!
        </h1>
        <p className="text-muted-foreground mb-6">
          Let’s head back to your fun learning adventures!
        </p>
        <Button asChild>
          <Link href="/learn">Return to Learning</Link>
        </Button>
      </div>
    </main>
  )
}
