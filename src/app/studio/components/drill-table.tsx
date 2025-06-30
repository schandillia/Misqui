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
import { Pencil, Timer, Trash2 } from "lucide-react"
import { useDrillStore } from "@/store/use-drills"
import { deleteDrill } from "@/app/actions/drills"
import toast from "react-hot-toast"
import { ConfirmationModal } from "@/components/modals/confirmation-modal"
import { logger } from "@/lib/logger"
import type { Drill } from "@/db/queries"

interface DrillTableProps {
  unitId?: number
}

export function DrillTable({ unitId }: DrillTableProps) {
  const TITLE_PREVIEW = 25

  const { drills, removeDrill, setEditingDrill } = useDrillStore()
  const [drillToDelete, setDrillToDelete] = useState<Drill | null>(null)

  // Filter drills by unitId if provided, otherwise show none
  const unitDrills = unitId
    ? drills.filter((drill) => drill.unitId === unitId)
    : []

  const handleDelete = async (drillId: number) => {
    const result = await deleteDrill(drillId)
    if (result.success) {
      toast.success("Drill deleted successfully!")
      removeDrill(drillId)
      setDrillToDelete(null)
    } else if (result.error) {
      toast.error(result.error.message)
      setDrillToDelete(null)
    }
  }

  const handleEdit = (drill: Drill) => {
    if (!drill.id) {
      logger.error("Invalid drill ID for editing", { drill })
      toast.error("Cannot edit drill: Invalid ID")
      return
    }
    logger.debug("Setting editing drill", {
      drillId: drill.id,
      title: drill.title,
    })
    setEditingDrill(drill)
  }

  if (!unitId) {
    return (
      <p className="text-sm text-muted-foreground p-6">No unit selected.</p>
    )
  }

  if (unitDrills.length === 0) {
    return (
      <p className="text-sm text-muted-foreground p-6">
        No drills found for this unit.
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
                Title
              </TableHead>
              <TableHead className="text-left text-sm font-semibold">
                Pace
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {unitDrills.map((drill) => (
              <TableRow key={drill.id} className="group">
                <TableCell className="py-2 text-sm text-muted-foreground">
                  {drill.drillNumber}
                </TableCell>
                <TableCell className="py-2 text-sm">
                  <span className={`block max-w-[${TITLE_PREVIEW}ch] truncate`}>
                    {drill.title}
                  </span>
                </TableCell>
                <TableCell className="py-2 text-muted-foreground">
                  {drill.isTimed && <Timer className="size-5 ml-1" />}
                </TableCell>
                <TableCell className="py-2 text-sm">
                  <div className="flex justify-end gap-x-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      className="hover:bg-transparent dark:hover:bg-transparent p-0"
                      size="sm"
                      onClick={() => handleEdit(drill)}
                    >
                      <Pencil className="size-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="hover:bg-transparent dark:hover:bg-transparent p-0"
                      size="sm"
                      onClick={() => setDrillToDelete(drill)}
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
      {drillToDelete && (
        <ConfirmationModal
          open={!!drillToDelete}
          onOpenChange={(open) => !open && setDrillToDelete(null)}
          title={drillToDelete.title}
          onConfirm={() => handleDelete(drillToDelete.id)}
          entityType="drill"
        />
      )}
    </>
  )
}
