"use client"

import * as React from "react"
import { useTransition } from "react"
import { format, getMonth, getYear, setMonth, setYear } from "date-fns"
import { Cake } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateBirthdate } from "@/app/actions/update-birthdate"
import { toast } from "react-hot-toast"
import { useSession } from "next-auth/react"

type BirthdateSelectionProps = {
  caption: string
  defaultValue?: string
  name?: string
  id?: string
  className?: string
}

export function BirthdateSelection({
  caption,
  defaultValue,
  name,
  id,
  className,
}: BirthdateSelectionProps) {
  const { data: session, status } = useSession()
  const currentYear = new Date().getFullYear()
  const fallbackDate = new Date(currentYear - 5, 0, 1) // Fallback for calendar navigation
  const [date, setDate] = React.useState<Date | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const [isPending, startTransition] = useTransition()

  // Initialize date from session or defaultValue
  React.useEffect(() => {
    if (status === "loading") return // Wait for session to load
    if (session?.user?.birthdate) {
      const sessionDate = new Date(session.user.birthdate)
      if (!isNaN(sessionDate.getTime())) {
        setDate(sessionDate)
      }
    } else if (defaultValue) {
      const propDate = new Date(defaultValue)
      if (!isNaN(propDate.getTime())) {
        setDate(propDate)
      }
    } else {
      setDate(null) // No date for display if session.birthdate and defaultValue are null
    }
  }, [session, status, defaultValue])

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const years = Array.from({ length: 100 }, (_, i) => {
    const year = currentYear - 5 - i // Start 5 years before current year
    return year.toString()
  })

  const handleMonthChange = (month: string) => {
    const targetDate = date || fallbackDate // Use fallback if no date set
    const newDate = setMonth(targetDate, months.indexOf(month))
    setDate(newDate)
  }

  const handleYearChange = (year: string) => {
    const targetDate = date || fallbackDate // Use fallback if no date set
    const newDate = setYear(targetDate, parseInt(year))
    setDate(newDate)
  }

  const handleSelect = (selectedData: Date | undefined) => {
    if (selectedData) {
      setDate(selectedData)
      setIsOpen(false)
      const formData = new FormData()
      // Send date in ISO format (YYYY-MM-DD) for consistency
      formData.append("birthdate", format(selectedData, "yyyy-MM-dd"))
      startTransition(async () => {
        try {
          const result = await updateBirthdate(formData)
          toast.success(result.message)
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update birthdate"
          )
        }
      })
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isPending}
          className={cn(
            "justify-start text-left",
            !date && "text-muted-foreground",
            `hover:scale-100 hover:translate-y-0 active:scale-100 active:translate-y-0
            transition-none`,
            className
          )}
        >
          <Cake className="mr-2 size-4" />
          {date ? format(date, "MMMM d, yyyy") : <span>{caption}</span>}
          <input
            type="hidden"
            name={name}
            id={id}
            value={date ? format(date, "yyyy-MM-dd") : ""}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-3xl" align="start">
        <div className="flex items-center justify-between gap-2 p-2">
          <Select
            onValueChange={handleMonthChange}
            value={
              date ? months[getMonth(date)] : months[getMonth(fallbackDate)]
            }
            disabled={isPending}
          >
            <SelectTrigger className="min-w-[6rem] flex-grow rounded-3xl cursor-pointer">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              {months.map((month) => (
                <SelectItem
                  key={month}
                  value={month}
                  className="rounded-3xl cursor-pointer"
                >
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={handleYearChange}
            value={
              date ? getYear(date).toString() : getYear(fallbackDate).toString()
            }
            disabled={isPending}
          >
            <SelectTrigger className="min-w-[6rem] flex-grow rounded-3xl cursor-pointer">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              {years.map((year) => (
                <SelectItem
                  key={year}
                  value={year}
                  className="rounded-3xl cursor-pointer"
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={handleSelect}
          initialFocus
          month={date || fallbackDate}
          onMonthChange={(newMonth) => setDate(newMonth)}
          disabled={(date) =>
            isPending || date > new Date() || date < new Date("1900-01-01")
          }
        />
      </PopoverContent>
    </Popover>
  )
}
