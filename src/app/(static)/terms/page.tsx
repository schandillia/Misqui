import { getTermsContent } from "@/lib/terms"

export default async function Page() {
  // Fetch the processed HTML content
  const termsHtml = await getTermsContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Terms of Use</h1>
        <div
          className="prose prose-lg text-gray-700"
          dangerouslySetInnerHTML={{ __html: termsHtml }}
        />
      </div>
    </div>
  )
}
