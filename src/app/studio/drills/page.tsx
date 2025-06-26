import UploadForm from "@/app/studio/drills/components/upload-form"

export default function Home() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload SVG to S3</h1>
      <UploadForm />
    </div>
  )
}
