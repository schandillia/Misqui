import { FeedWrapper } from "@/components/feed-wrapper"
import { HeaderSection } from "@/components/header-section"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { getUserProgress, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"
import { UserAvatar } from "@/components/user-avatar"
import { auth } from "@/auth"
import { Promo } from "@/components/promo"
import ThemeToggle from "@/components/theme-toggle"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    <div className="flex flex-col gap-6 px-4 lg:flex-row-reverse lg:gap-[48px] lg:px-6">
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
          imageSrc="/images/mascots/mascot.svg"
          imageAlt="Settings"
          title="Settings"
          description="Manage your account settings and preferences"
        />

        <div className="space-y-6 lg:space-y-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <UserAvatar
                  name={session?.user?.name}
                  image={session?.user?.image}
                  className="size-16"
                />
                <button className="w-full rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 sm:w-auto dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600">
                  Change Avatar
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={session?.user?.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    defaultValue={session?.user?.email || ""}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                <div>
                  <Label>Current Course</Label>
                  <p className="mt-1 text-sm font-medium">
                    {userProgress.activeCourse.title}
                  </p>
                </div>
                <div>
                  <Label>Total Points</Label>
                  <p className="mt-1 text-sm font-medium">
                    {userProgress.points}
                  </p>
                </div>
                <div>
                  <Label>Current Streak</Label>
                  <p className="mt-1 text-sm font-medium">
                    {userProgress.currentStreak} days
                  </p>
                </div>
                <div>
                  <Label>Longest Streak</Label>
                  <p className="mt-1 text-sm font-medium">
                    {userProgress.longestStreak} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-muted-foreground text-sm">
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </p>
                </div>
                <button
                  className={`w-full rounded-lg px-4 py-2 font-medium transition-colors sm:w-auto ${
                    isPro
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600"
                  }`}
                >
                  {isPro ? "Manage Subscription" : "Upgrade to Pro"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-muted-foreground text-sm">
                    Toggle dark mode appearance
                  </p>
                </div>
                <ThemeToggle />
              </div>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <Label>Sound Effects</Label>
                  <p className="text-muted-foreground text-sm">
                    Enable sound effects during exercises
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <Label>Connected Account</Label>
                  <p className="text-muted-foreground text-sm">
                    Google Account
                  </p>
                </div>
                <button className="w-full rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 sm:w-auto dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600">
                  Manage
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600">
                Export Data
              </button>
              <button className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">
                Delete Account
              </button>
            </CardContent>
          </Card>
        </div>
      </FeedWrapper>
    </div>
  )
}

export default Page
