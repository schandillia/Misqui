"use client"

import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"
import { TbFileTypeSvg } from "react-icons/tb"
import { useCallback } from "react"
import { FileRejection, useDropzone } from "react-dropzone"
import toast from "react-hot-toast"

export function Uploader() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    if (acceptedFiles.length > 0) {
      toast.success("File accepted")
    }
  }, [])

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    // Check for too-many-files
    if (fileRejections.length > 1) {
      toast.error("You can only upload one file at a time")
    }

    // Process individual file errors
    fileRejections.forEach((rejection) => {
      rejection.errors.forEach((error) => {
        if (error.code === "file-too-large") {
          toast.error("Your upload is larger than 100 kB")
        } else if (error.code === "file-invalid-type") {
          toast.error("Only SVG files are allowed")
        }
      })
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 1,
    maxSize: 1024 * 100, // 100 kB
    accept: {
      "image/svg+xml": [".svg"],
    },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        `relative border-2 border-dashed transition-colors duration-200 ease-in-out
        w-full h-full flex flex-col items-center justify-center rounded-3xl
        cursor-pointer`,
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary/50"
      )}
    >
      <input {...getInputProps()} />
      <div
        className="flex flex-col items-center justify-center h-full w-full gap-y-3
          text-muted-foreground"
      >
        {isDragActive ? (
          <TbFileTypeSvg className="size-6" />
        ) : (
          <Upload className="size-6" />
        )}
        <p className="text-sm">
          {isDragActive
            ? "Drop your file here…"
            : "Drag and drop an SVG file here, or click to select one"}
        </p>
      </div>
    </div>
  )
}
