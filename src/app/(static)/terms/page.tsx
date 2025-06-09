import { getLegalContent } from "@/lib/legal-content"

export default async function Page() {
  const termsHtml = await getLegalContent("TERMS.md")

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-neutral-700 dark:text-neutral-300">
        Terms of Use
      </h1>
      <div
        className="prose prose-lg text-neutral-700 dark:text-neutral-300"
        dangerouslySetInnerHTML={{ __html: termsHtml }}
      />
    </div>
  )
}
