// File: app/(main)/learn/page.tsx
import { UnitHeader } from "@/app/(main)/learn/components/unit-header"
import { RightColumn } from "@/app/(main)/components/right-column"
import { getStats, getUnits, getUserSubscription } from "@/db/queries"
import { userDrillCompletion } from "@/db/schema"
import { redirect } from "next/navigation"
import { eq, and } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { upsertUserDrillCompletion } from "@/app/actions/drill-completion"
import DrillsList from "@/app/(main)/learn/components/drills-list"
import { UserStats } from "@/app/(main)/components/user-stats"
import { PromoCard } from "@/app/(main)/components/promo-card"
import { MissionsCard } from "@/app/(main)/components/missions-card"
import { UnitWithDrills } from "@/db/queries/types"

const Page = async () => {
  const [userSubscription, stats, units] = await Promise.all([
    getUserSubscription(),
    getStats(),
    getUnits(),
  ])

  const isPro = !!userSubscription?.isActive

  if (!stats || !stats.activeCourse) {
    redirect("/courses")
  }

  const activeCourse = stats.activeCourse
  if (!activeCourse) {
    redirect("/courses")
  }

  const userId = stats.userId
  if (!userId) redirect("/login")

  const drillCompletion = await db
    .select({
      currentDrillId: userDrillCompletion.currentDrillId,
      questionsCompleted: userDrillCompletion.questionsCompleted,
    })
    .from(userDrillCompletion)
    .where(
      and(
        eq(userDrillCompletion.userId, userId),
        eq(userDrillCompletion.courseId, activeCourse.id)
      )
    )
    .limit(1)

  const firstDrill = units[0]?.drills[0]
  const drillId = drillCompletion[0]?.currentDrillId ?? firstDrill?.id ?? null
  const questionsCompleted = drillCompletion[0]?.questionsCompleted ?? 0

  const { currentDrillId, questionsCompleted: updatedQuestionsCompleted } =
    await upsertUserDrillCompletion(
      userId,
      activeCourse.id,
      drillId,
      questionsCompleted
    )

  const currentUnit = units.find((unit: UnitWithDrills) =>
    unit.drills.some((drill) => drill.id === currentDrillId)
  )
  const currentUnitOrder = currentUnit?.order ?? units[0]?.order ?? 0

  return (
    <div className="flex flex-row gap-[48px] px-6">
      <div className="relative top-0 flex-1 pb-10">
        <div
          className="sticky top-0 mb-5 flex items-center justify-center border-b-2 pb-3
            text-neutral-400 lg:z-50 lg:mt-[-28px] lg:pt-[28px] bg-neutral-50
            dark:bg-neutral-900"
        >
          <h1 className="text-lg font-bold uppercase">{activeCourse.title}</h1>
        </div>
        {units.map((unit: UnitWithDrills) => {
          const isActive = unit.order <= currentUnitOrder
          return (
            <div key={unit.id} className="mb-16">
              <UnitHeader
                title={unit.title}
                description={unit.description}
                unitId={unit.id}
                firstDrillId={unit.drills[0]?.id}
                isActive={isActive}
              />
              {isActive && (
                <DrillsList
                  drills={unit.drills}
                  currentDrillId={currentDrillId}
                  questionsCompleted={updatedQuestionsCompleted ?? 0} // Coerce to number
                  courseId={activeCourse.id}
                  unitNumber={unit.unitNumber}
                  gems={stats.gems}
                  isPro={isPro}
                />
              )}
            </div>
          )
        })}
      </div>
      <RightColumn>
        <UserStats
          activeCourse={stats.activeCourse}
          gems={stats.gems}
          points={stats.points}
          hasActiveSubscription={isPro}
          currentStreak={stats.currentStreak}
          lastActivityDate={stats.lastActivityDate}
        />
        {!isPro && <PromoCard />}
        <MissionsCard points={stats.points} />
      </RightColumn>
    </div>
  )
}
export default Page
