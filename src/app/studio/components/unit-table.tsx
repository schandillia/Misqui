"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { useUnitStore } from "@/store/use-units"
import { deleteUnit } from "@/app/actions/units"
import toast from "react-hot-toast"
import { ConfirmationModal } from "@/components/modals/confirmation-modal"
import { logger } from "@/lib/logger"
import type { Unit } from "@/db/queries/index"

interface UnitTableProps {
  courseId?: number
}

export function UnitTable({ courseId }: UnitTableProps) {
  const TITLE_PREVIEW = 10
  const DESCRIPTION_PREVIEW = 25
  const NOTES_PREVIEW = 25

  const { units, removeUnit, setEditingUnit } = useUnitStore()
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)

  // Filter units by courseId if provided, otherwise show none
  const courseUnits = courseId
    ? units.filter((unit) => unit.courseId === courseId)
    : []

  const handleDelete = async (unitId: number) => {
    const result = await deleteUnit(unitId)
    if (result.success) {
      toast.success("Unit deleted successfully!")
      removeUnit(unitId)
      setUnitToDelete(null)
    } else if (result.error) {
      toast.error(result.error.message)
      setUnitToDelete(null)
    }
  }

  const handleEdit = (unit: Unit) => {
    if (!unit.id) {
      logger.error("Invalid unit ID for editing", { unit })
      toast.error("Cannot edit unit: Invalid ID")
      return
    }
    logger.debug("Setting editing unit", {
      unitId: unit.id,
      title: unit.title,
    })
    setEditingUnit(unit)
  }

  if (!courseId) {
    return (
      <p className="text-sm text-muted-foreground p-6">No course selected.</p>
    )
  }

  if (courseUnits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground p-6">
        No units found for this course.
      </p>
    )
  }

  return (
    <>
      <div className="overflow-x-auto px-5">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-sm font-semibold">
                No.
              </TableHead>
              <TableHead className="text-left text-sm font-semibold">
                Unit Title
              </TableHead>
              <TableHead className="text-left text-sm font-semibold">
                Description
              </TableHead>
              <TableHead className="text-left text-sm font-semibold">
                Notes
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseUnits.map((unit) => (
              <TableRow key={unit.id} className="group">
                <TableCell className="py-2 text-sm text-muted-foreground">
                  {unit.unitNumber}
                </TableCell>
                <TableCell className="py-2 text-sm">
                  <span className={`block max-w-[${TITLE_PREVIEW}ch] truncate`}>
                    {unit.title}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground">
                  <span
                    className={`block max-w-[${DESCRIPTION_PREVIEW}ch] truncate`}
                  >
                    {unit.description}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground">
                  <span
                    className={`block max-w-[${NOTES_PREVIEW}ch] truncate overflow-hidden text-ellipsis
                    whitespace-nowrap`}
                  >
                    {unit.notes || "No notes provided"}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-sm">
                  <div className="flex justify-end gap-x-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      className="hover:bg-transparent dark:hover:bg-transparent p-0"
                      size="sm"
                      onClick={() => handleEdit(unit)}
                    >
                      <Pencil className="size-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:bg-transparent dark:hover:bg-transparent p-0"
                      size="sm"
                      onClick={() => setUnitToDelete(unit)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {unitToDelete && (
        <ConfirmationModal
          open={!!unitToDelete}
          onOpenChange={(open) => !open && setUnitToDelete(null)}
          title={unitToDelete.title}
          onConfirm={() => handleDelete(unitToDelete.id)}
          entityType="unit"
        />
      )}
    </>
  )
}
