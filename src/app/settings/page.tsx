import { FeedWrapper } from "@/components/feed-wrapper"
import { HeaderSection } from "@/components/header-section"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { getUserProgress, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"
import { UserAvatar } from "@/components/user-avatar"
import { auth } from "@/auth"
import { Promo } from "@/components/promo"

const Page = async () => {
  const session = await auth()
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const [userProgress, userSubscription] = await Promise.all([
    userProgressData,
    userSubscriptionData,
  ])

  if (!userProgress || !userProgress.activeCourse) redirect("/courses")

  const isPro = !!userSubscription?.isActive

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          gems={userProgress.gems}
          points={userProgress.points}
          hasActiveSubscription={isPro}
          currentStreak={userProgress.currentStreak}
          lastActivityDate={userProgress.lastActivityDate}
        />
        {!isPro && <Promo />}
      </StickyWrapper>
      <FeedWrapper>
        <HeaderSection
          imageSrc="/settings.svg"
          imageAlt="Settings"
          title="Settings"
          description="Manage your account settings and preferences"
        />
        
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-x-4">
                <UserAvatar
                  name={session?.user?.name}
                  image={session?.user?.image}
                  className="size-16"
                />
                <button className="px-4 py-2 border rounded-md">Change Avatar</button>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Name</p>
                <p className="font-medium">{session?.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Email</p>
                <p className="font-medium">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Learning Progress */}
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Learning Progress</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Current Course</p>
                <p className="font-medium">{userProgress.activeCourse.title}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Points</p>
                <p className="font-medium">{userProgress.points}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Current Streak</p>
                <p className="font-medium">{userProgress.currentStreak} days</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Longest Streak</p>
                <p className="font-medium">{userProgress.longestStreak} days</p>
              </div>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {isPro ? "Pro Plan" : "Free Plan"}
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                {isPro ? "Manage Subscription" : "Upgrade to Pro"}
              </button>
            </div>
          </div>

          {/* Account Settings */}
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Toggle dark mode appearance
                  </p>
                </div>
                <button className="px-4 py-2 border rounded-md">Toggle</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Enable sound effects during lessons
                  </p>
                </div>
                <button className="px-4 py-2 border rounded-md">Toggle</button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Security</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connected Account</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Google Account
                </p>
              </div>
              <button className="px-4 py-2 border rounded-md">Manage</button>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Data & Privacy</h2>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 border rounded-md">Export Data</button>
              <button className="w-full px-4 py-2 bg-red-500 text-white rounded-md">Delete Account</button>
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  )
}

export default Page
