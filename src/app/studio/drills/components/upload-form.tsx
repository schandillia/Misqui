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
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { useState, useEffect } from "react"

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50 * 1024, {
      message: "File size must be less than 50KB",
    })
    .refine((file) => file.type === "image/svg+xml", {
      message: "Only SVG files are allowed",
    }),
})

export default function UploadForm() {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
        toast.success(result.message, { id: "upload" })
        setFileUrl(result.url)
        console.log("File URL:", result.url)
        form.reset()
      } else {
        toast.error(result.error || "Upload failed", { id: "upload" })
        setFileUrl(null)
      }
    } catch (error) {
      toast.error("Upload failed", { id: "upload" })
      console.error("Upload error:", error)
      setFileUrl(null)
    }
  }

  useEffect(() => {
    const file = form.getValues("file")
    if (file) {
      form.trigger("file").then((isValid) => {
        if (isValid) {
          const validation = formSchema.safeParse({ file })
          if (validation.success) {
            onSubmit(validation.data)
          }
        }
      })
    }
  }, [form.watch("file")])

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
                <Input
                  type="file"
                  accept="image/svg+xml"
                  onChange={(e) =>
                    field.onChange(e.target.files?.[0] || undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {fileUrl && (
          <FormItem>
            <FormLabel>Uploaded File URL</FormLabel>
            <FormControl>
              <Input
                type="text"
                value={fileUrl}
                readOnly
                className="bg-gray-100 cursor-pointer"
                onClick={(e) => e.currentTarget.select()}
              />
            </FormControl>
          </FormItem>
        )}
      </form>
    </Form>
  )
}
