// File: app/(main)/learn/components/drills-list.tsx
import Link from "next/link"
import { UnitWithDrills } from "@/db/queries/types" // Import UnitWithDrills
import app from "src/lib/data/app.json"
import DrillButton from "@/app/(main)/learn/components/drill-button"
import DrillButtonWrapper from "@/app/(main)/learn/components/drill-button-wrapper"

type DrillsListProps = {
  drills: UnitWithDrills["drills"] // Align with query output
  currentDrillId: number | null
  questionsCompleted: number // Non-nullable, as guaranteed by page.tsx
  courseId: number
  unitNumber: number
  gems: number
  isPro: boolean
}

const DrillsList = ({
  drills,
  currentDrillId,
  questionsCompleted,
  courseId,
  unitNumber,
  gems,
  isPro,
}: DrillsListProps) => {
  return (
    <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[...drills]
        .sort((a, b) => a.drillNumber - b.drillNumber)
        .map((drill, index) => {
          const isUnlocked =
            currentDrillId !== null && drill.id <= currentDrillId
          const isCurrent = drill.id === currentDrillId
          const isTimed = drill.isTimed

          let label: string | null = null
          if (isCurrent) {
            if (questionsCompleted > 0 && !isTimed) {
              label = "Resume"
            } else {
              label = "Start"
            }
          }

          const percentage = Math.min(
            100,
            (questionsCompleted / app.QUESTIONS_PER_DRILL) * 100
          )

          const wrappedButton = (
            <DrillButtonWrapper
              index={index}
              totalCount={drills.length}
              isCompleted={false}
              current={isCurrent}
              label={label}
              drillId={drill.id}
              gems={gems}
              isPro={isPro}
            >
              <DrillButton
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
                isTimed={isTimed}
                drillNumber={drill.drillNumber}
                percentage={percentage}
                disabled={!isUnlocked}
              />
            </DrillButtonWrapper>
          )

          return isUnlocked ? (
            <Link
              key={drill.id}
              href={`/drill/${courseId}/${unitNumber}/${drill.drillNumber}`}
              className="mb-2"
            >
              {wrappedButton}
            </Link>
          ) : (
            <div key={drill.id} className="mb-2">
              {wrappedButton}
            </div>
          )
        })}
    </div>
  )
}

export default DrillsList
