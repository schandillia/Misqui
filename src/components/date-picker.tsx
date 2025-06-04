"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  caption: string
  defaultValue?: string
  name?: string
  id?: string
  className?: string
}

export function DatePicker({
  caption,
  defaultValue,
  name,
  id,
  className,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined
  )
  const [isOpen, setIsOpen] = React.useState(false)

  // Sync defaultValue changes with state
  React.useEffect(() => {
    setDate(defaultValue ? new Date(defaultValue) : undefined)
  }, [defaultValue])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "justify-start text-left",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMMM d, yyyy") : <span>{caption}</span>}
          <input
            type="hidden"
            name={name}
            id={id}
            value={date ? format(date, "MMMM d, yyyy") : ""}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-3xl" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />
      </PopoverContent>
    </Popover>
  )
}
