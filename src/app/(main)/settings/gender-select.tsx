"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { genderEnum } from "@/db/schema/types"
import { updateUserGender } from "@/app/actions/update-user-gender"
import { useState, useTransition } from "react"
import toast from "react-hot-toast"

type GenderSelectProps = {
  defaultValue?: (typeof genderEnum.enumValues)[number] | null | undefined
}

function isValidGender(
  value: string
): value is (typeof genderEnum.enumValues)[number] {
  return (genderEnum.enumValues as readonly string[]).includes(value)
}

export function GenderSelect({ defaultValue }: GenderSelectProps) {
  const [gender, setGender] = useState(defaultValue ?? undefined)
  const [isPending, startTransition] = useTransition()

  const handleValueChange = (value: string) => {
    if (isValidGender(value) && value !== gender) {
      setGender(value)
      const formData = new FormData()
      formData.append("gender", value)
      startTransition(async () => {
        try {
          const result = await updateUserGender(formData)
          toast.success(result.message)
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to update gender"
          )
        }
      })
    }
  }

  return (
    <RadioGroup
      defaultValue={defaultValue ?? undefined}
      name="gender"
      onValueChange={handleValueChange}
      className="flex space-x-4"
      disabled={isPending}
    >
      {genderEnum.enumValues.map((gender) => (
        <div key={gender} className="flex items-center space-x-2">
          <RadioGroupItem
            value={gender}
            id={`gender-${gender}`}
            className="cursor-pointer"
          />
          <Label
            htmlFor={`gender-${gender}`}
            className="cursor-pointer capitalize text-sm font-normal"
          >
            {gender}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
