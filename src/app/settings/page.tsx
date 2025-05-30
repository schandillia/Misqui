import { FeedWrapper } from "@/components/feed-wrapper"
import { HeaderSection } from "@/components/header-section"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { getUserProgress, getUserSubscription } from "@/db/queries"
import { redirect } from "next/navigation"
import { UserAvatar } from "@/components/user-avatar"
import { auth } from "@/auth"
import { Promo } from "@/components/promo"
import ThemeToggle from "@/components/theme/theme-toggle"
import ColorSwitcher from "@/components/theme/color-switcher"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const Page = async () => {
  const sessionData = auth()
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()

  const [session, userProgress, userSubscription] = await Promise.all([
    sessionData,
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
                <Button variant="ghost" className="w-full sm:w-auto">
                  Change Avatar
                </Button>
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
                <Button
                  variant={isPro ? "primary" : "ghost"}
                  className="w-full sm:w-auto"
                >
                  {isPro ? "Manage Subscription" : "Upgrade to Pro"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
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
                  <Label>Color Theme</Label>
                  <p className="text-muted-foreground text-sm">
                    Choose your preferred color theme
                  </p>
                </div>
                {isPro && <ColorSwitcher isPro />}
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
                <Button variant="ghost" className="w-full sm:w-auto">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="ghost" className="w-full">
                Export Data
              </Button>
              <Button variant="danger" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </FeedWrapper>
    </div>
  )
}

export default Page
