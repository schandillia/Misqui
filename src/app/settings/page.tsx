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
    <div className="flex flex-col lg:flex-row-reverse gap-6 lg:gap-[48px] px-4 lg:px-6">
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
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <UserAvatar
                  name={session?.user?.name}
                  image={session?.user?.image}
                  className="size-16"
                />
                <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
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
                  <Input id="email" defaultValue={session?.user?.email || ""} disabled />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <Label>Current Course</Label>
                  <p className="text-sm font-medium mt-1">{userProgress.activeCourse.title}</p>
                </div>
                <div>
                  <Label>Total Points</Label>
                  <p className="text-sm font-medium mt-1">{userProgress.points}</p>
                </div>
                <div>
                  <Label>Current Streak</Label>
                  <p className="text-sm font-medium mt-1">{userProgress.currentStreak} days</p>
                </div>
                <div>
                  <Label>Longest Streak</Label>
                  <p className="text-sm font-medium mt-1">{userProgress.longestStreak} days</p>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </p>
                </div>
                <button className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPro 
                    ? "bg-blue-500 text-white hover:bg-blue-600" 
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                }`}>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle dark mode appearance
                  </p>
                </div>
                <ThemeToggle />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable sound effects during lessons
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Label>Connected Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Google Account
                  </p>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
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
              <button className="w-full px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                Export Data
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
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