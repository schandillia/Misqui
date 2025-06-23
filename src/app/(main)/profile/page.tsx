import { Feed } from "@/app/(main)/components/feed"
import { HeaderSection } from "@/app/(main)/components/header-section"
import { MissionsCard } from "@/app/(main)/components/missions-card"
import { PromoCard } from "@/app/(main)/components/promo-card"
import { RightColumn } from "@/app/(main)/components/right-column"
import { UserStats } from "@/app/(main)/components/user-stats"
import { getStats, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { logger } from "@/lib/logger"
import { ProfileCard } from "@/app/(main)/profile/components/profile-card"
import { CourseCompletionCard } from "@/app/(main)/profile/components/course-completion-card"

const Page = async () => {
  const session = await auth()
  const userId = session?.user?.id

  const [userStats, userSubscription] = await Promise.all([
    getStats().catch((error) => {
      logger.error("Error fetching stats", {
        error,
        userId,
        module: "profile",
      })
      return null
    }),
    getUserSubscription(userId).catch((error) => {
      logger.error("Error fetching subscription", {
        error,
        userId,
        module: "profile",
      })
      return null
    }),
  ])

  if (!userStats) {
    logger.warn("Missing required data for profile page", {
      userId,
      hasStats: !!userStats,
      module: "profile",
    })
    redirect("/")
  }

  const isPro = !!userSubscription?.isActive

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <RightColumn>
        <UserStats
          activeCourse={userStats.activeCourse}
          gems={userStats.gems}
          points={userStats.points}
          hasActiveSubscription={isPro}
          currentStreak={userStats.currentStreak}
          lastActivityDate={userStats.lastActivityDate}
        />
        {!isPro && <PromoCard />}
        <MissionsCard points={userStats.points} />
      </RightColumn>
      <Feed>
        <div className="flex w-full cursor-default flex-col items-center">
          <HeaderSection
            imageSrc="/images/mascots/mascot.svg"
            imageAlt="Profile"
            title="Profile"
            description="View and manage your profile"
          />

          <div className="w-full space-y-6 lg:space-y-8">
            {/* Profile Information */}
            <ProfileCard session={session} />
            <CourseCompletionCard session={session} />
          </div>
        </div>
      </Feed>
    </div>
  )
}
export default Page
