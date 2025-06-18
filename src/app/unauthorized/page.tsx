import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  return (
    <main className="min-h-screen bg-brand-50 dark:bg-brand-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-brand-700 dark:text-brand-100 mb-2 text-4xl font-bold">
          Oops, this area is for grown-up helpers only!
        </h1>
        <p className="text-brand-600 dark:text-brand-200 mb-6 text-lg">
          Let’s head back to your fun learning adventures!
        </p>
        <Button asChild variant="primary">
          <Link href="/learn">Return to Learning</Link>
        </Button>
      </div>
    </main>
  )
}
