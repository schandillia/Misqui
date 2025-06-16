"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, Plus, Check, ChevronsUpDown } from "lucide-react"
import { useCourseStore } from "@/store/use-courses"
import { useUnitStore } from "@/store/use-units"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getUnitsByCourseId, Unit, deleteUnit } from "@/app/actions/units"
import { EditUnitModal } from "@/components/modals/edit-unit-modal"
import { ConfirmationModal } from "@/components/modals/confirmation-modal"
import toast from "react-hot-toast"

export function UnitsList() {
  const NOTES_PREVIEW = 10
  const TITLE_PREVIEW = 10
  const DESCRIPTION_PREVIEW = 25

  const { courses } = useCourseStore()
  const {
    setUnits: updateStoreUnits,
    addUnit,
    updateUnit,
    removeUnit,
  } = useUnitStore()
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [openCombobox, setOpenCombobox] = useState(false)
  const [units, setLocalUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null) // Track unit to delete

  // Fetch units when selectedCourseId changes
  useEffect(() => {
    if (!selectedCourseId) {
      setLocalUnits([])
      updateStoreUnits([])
      setError(null)
      return
    }

    const fetchUnits = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await getUnitsByCourseId(selectedCourseId)

        if (response.success && response.data) {
          setLocalUnits(response.data)
          updateStoreUnits(response.data)
        } else {
          const errorMessage =
            response.error?.message || "Failed to fetch units"
          setError(errorMessage)
          setLocalUnits([])
          updateStoreUnits([])
        }
      } catch (err) {
        setError("Failed to fetch units. Please try again.")
        setLocalUnits([])
        updateStoreUnits([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUnits()
  }, [selectedCourseId, updateStoreUnits])

  const handleUnitCreated = (newUnit: Unit) => {
    const updatedUnits = [newUnit, ...units]
    setLocalUnits(updatedUnits)
    addUnit(newUnit)
  }

  const handleUnitUpdated = (updatedUnit: Unit) => {
    const updatedUnits = units.map((unit) =>
      unit.id === updatedUnit.id ? updatedUnit : unit
    )
    setLocalUnits(updatedUnits)
    updateUnit(updatedUnit)
  }

  const handleEditClick = (unit: Unit) => {
    setSelectedUnit(unit)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (unitId: number) => {
    const result = await deleteUnit(unitId)
    if (result.success) {
      toast.success("Unit deleted successfully!")
      setLocalUnits(units.filter((unit) => unit.id !== unitId))
      removeUnit(unitId)
      setUnitToDelete(null)
    } else if (result.error) {
      toast.error(
        `${result.error.message}${result.error.details ? `: ${result.error.details}` : ""}`
      )
      setUnitToDelete(null)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="defaultOutline"
              role="combobox"
              aria-expanded={openCombobox}
              className="w-full sm:w-[200px] items-center"
            >
              <div className="flex items-center w-full">
                {selectedCourseId
                  ? courses.find((course) => course.id === selectedCourseId)
                      ?.title
                  : "Select course"}
                <ChevronsUpDown className="shrink-0 size-4 opacity-50 ml-2" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search course…" className="h-9" />
              <CommandList>
                <CommandEmpty>No course found.</CommandEmpty>
                <CommandGroup>
                  {courses.map((course) => (
                    <CommandItem
                      key={course.id}
                      value={course.id.toString()}
                      onSelect={(currentValue) => {
                        const newCourseId = Number(currentValue)
                        setSelectedCourseId(
                          newCourseId === selectedCourseId ? null : newCourseId
                        )
                        setOpenCombobox(false)
                      }}
                    >
                      {course.title}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedCourseId === course.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex gap-2">
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedCourseId}
          >
            <Plus className="mr-2 size-4" />
            Add Unit
          </Button>
        </div>
      </div>
      {selectedCourseId ? (
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading units…</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : units.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No units found for this course.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-sm font-semibold">
                    Title
                  </TableHead>
                  <TableHead className="text-left text-sm font-semibold">
                    Description
                  </TableHead>
                  <TableHead className="text-left text-sm font-semibold">
                    Notes
                  </TableHead>
                  <TableHead className="text-left text-sm font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="py-2 text-sm">
                      <span
                        className={`block max-w-[${TITLE_PREVIEW}ch] truncate`}
                      >
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
                        className={`block max-w-[${NOTES_PREVIEW}ch] truncate`}
                      >
                        {unit.notes}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-sm">
                      <div className="flex justify-between gap-6">
                        <Button
                          variant="ghost"
                          className="hover:bg-transparent dark:hover:bg-transparent p-0"
                          size="sm"
                          onClick={() => handleEditClick(unit)}
                        >
                          <Pencil className="size-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="hover:bg-transparent dark:hover:bg-transparent p-0"
                          size="sm"
                          onClick={() => setUnitToDelete(unit)}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Please select a course.</p>
      )}

      {/* Create Modal */}
      <EditUnitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        courseId={selectedCourseId || 0}
        onUnitCreated={handleUnitCreated}
      />

      {/* Edit Modal */}
      {selectedUnit && (
        <EditUnitModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          unit={selectedUnit}
          onUnitUpdated={handleUnitUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
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
