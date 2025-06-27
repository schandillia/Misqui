"use client"

import { Input } from "@/components/ui/input"
import { svgUploadSchema } from "@/lib/schemas/svg-upload"
import toast from "react-hot-toast"
import { useState, useRef, useEffect } from "react"
import app from "@/lib/data/app.json"

interface FileUploaderProps {
  onUploadSuccess?: (url: string) => void
  initialUrl?: string
}

export default function FileUploader({
  onUploadSuccess,
  initialUrl = "",
}: FileUploaderProps) {
  const [inputMode, setInputMode] = useState<"file" | "url">(
    initialUrl ? "url" : "file"
  )
  const [fileUrl, setFileUrl] = useState<string>(initialUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputMode(initialUrl ? "url" : "file")
    setFileUrl(initialUrl)
  }, [initialUrl])

  const onSubmitFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    toast.loading("Uploading SVG…", { id: "upload" })

    try {
      const response = await fetch("/api/s3/upload", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()

      if (response.ok && result.url) {
        const cloudfrontDomain = `https://${app.CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME}`
        const s3Url = new URL(result.url)
        const cloudfrontUrl = `${cloudfrontDomain}${s3Url.pathname}`
        toast.success(result.message, { id: "upload" })
        setFileUrl(cloudfrontUrl)
        onUploadSuccess?.(cloudfrontUrl)
        setInputMode("url")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        toast.error(result.error || "Upload failed", { id: "upload" })
        setFileUrl("")
        onUploadSuccess?.("")
        setInputMode("file")
      }
    } catch (error) {
      toast.error("Upload failed", { id: "upload" })
      console.error("Upload error:", error)
      setFileUrl("")
      onUploadSuccess?.("")
      setInputMode("file")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = svgUploadSchema.safeParse(file)
      if (validation.success) {
        onSubmitFile(file)
      } else {
        toast.error(validation.error.errors[0]?.message || "Invalid file", {
          id: "upload",
        })
        setFileUrl("")
        onUploadSuccess?.("")
        setInputMode("file")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const handleReset = () => {
    setInputMode("file")
    setFileUrl("")
    onUploadSuccess?.("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Input
      key={inputMode}
      type={inputMode === "file" ? "file" : "text"}
      accept={inputMode === "file" ? "image/svg+xml" : undefined}
      ref={fileInputRef}
      onChange={inputMode === "file" ? handleFileChange : undefined}
      value={inputMode === "url" ? fileUrl : undefined}
      readOnly={inputMode === "url"}
      onClick={
        inputMode === "url" ? (e) => e.currentTarget.select() : undefined
      }
      onDoubleClick={inputMode === "url" ? handleReset : undefined}
      className={
        inputMode === "url"
          ? "bg-gray-100 cursor-pointer transition-all duration-300 ease-in-out"
          : "cursor-pointer"
      }
      title={
        inputMode === "url" ? "Double-click to upload another file" : undefined
      }
    />
  )
}
