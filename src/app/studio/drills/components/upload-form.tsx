"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { useState, useRef } from "react"
import { Upload } from "lucide-react"

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50 * 1024, {
      message: "File size must be less than 50KB",
    })
    .refine((file) => file.type === "image/svg+xml", {
      message: "Only SVG files are allowed",
    })
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function UploadForm() {
  const [inputMode, setInputMode] = useState<"file" | "filename" | "url">(
    "file"
  )
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const onSubmit = async (data: FormValues) => {
    if (!data.file) return

    const formData = new FormData()
    formData.append("file", data.file)
    toast.loading("Uploading SVG...", { id: "upload" })

    try {
      const response = await fetch("/api/s3/upload", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()

      if (response.ok && result.url) {
        const cloudfrontDomain = `https://${process.env.NEXT_PUBLIC_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME}`
        const s3Url = new URL(result.url)
        const cloudfrontUrl = `${cloudfrontDomain}${s3Url.pathname}`
        toast.success(result.message, { id: "upload" })
        setFileUrl(cloudfrontUrl)
        setInputMode("url")
        form.reset()
      } else {
        toast.error(result.error || "Upload failed", { id: "upload" })
        setFileUrl(null)
        setInputMode("file")
        setFileName(null)
      }
    } catch (error) {
      toast.error("Upload failed", { id: "upload" })
      console.error("Upload error:", error)
      setFileUrl(null)
      setInputMode("file")
      setFileName(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("file", file, { shouldValidate: true })
      setFileName(file.name)
      setInputMode("filename")
      form.trigger("file").then((isValid) => {
        if (isValid) {
          const validation = formSchema.safeParse({ file })
          if (validation.success) {
            onSubmit(validation.data)
          } else {
            setInputMode("file")
            setFileName(null)
          }
        } else {
          setInputMode("file")
          setFileName(null)
        }
      })
    }
  }

  const handleReset = () => {
    setInputMode("file")
    setFileName(null)
    setFileUrl(null)
    form.reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload SVG</FormLabel>
              <FormControl>
                <div className="relative">
                  {inputMode === "file" || inputMode === "filename" ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/svg+xml"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      {inputMode === "filename" && fileName && (
                        <div className="flex-1">
                          <Input
                            type="text"
                            value={fileName}
                            readOnly
                            className="bg-gray-100 cursor-default"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      type="text"
                      value={fileUrl || ""}
                      readOnly
                      className="bg-gray-100 cursor-pointer transition-all duration-300 ease-in-out"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {(inputMode === "filename" || inputMode === "url") && (
          <Button
            type="button"
            variant="default"
            onClick={handleReset}
            className="mt-2"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Another
          </Button>
        )}
      </form>
    </Form>
  )
}
