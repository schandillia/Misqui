import { FeedWrapper } from "@/components/feed-wrapper"
import { HeaderSection } from "@/components/header-section"
import { StickyWrapper } from "@/components/sticky-wrapper"
import { UserProgress } from "@/components/user-progress"
import { getUserProgress, getUserSubscription } from "@/db/queries"
import { getUserSoundPreference } from "@/db/queries/sound-settings"
import { redirect } from "next/navigation"
import { UserAvatar } from "@/components/user-avatar"
import { auth } from "@/auth"
import { Promo } from "@/components/promo"
import ThemeToggle from "@/components/theme/theme-toggle"
import ColorSwitcher from "@/components/theme/color-switcher"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SoundToggle } from "@/components/sound-toggle"

const Page = async () => {
  const sessionData = auth()
  const userProgressData = getUserProgress()
  const userSubscriptionData = getUserSubscription()
  const userSoundPreferenceData = getUserSoundPreference()

  const [session, userProgress, userSubscription, userSoundPreference] =
    await Promise.all([
      sessionData,
      userProgressData,
      userSubscriptionData,
      userSoundPreferenceData,
    ])

  if (!userProgress || !userProgress.activeCourse) redirect("/courses")
  if (!userSoundPreference) redirect("/") // Redirect if sound preference is not found

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
        <div className="flex w-full flex-col items-center">
          <HeaderSection
            imageSrc="/images/icons/settings.svg"
            imageAlt="Store"
            title="Store"
            description="Manage your account settings and preferences"
          />

          <div className="w-full space-y-6 lg:space-y-8">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
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

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-muted-foreground">
                      Toggle dark mode appearance
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
                {isPro && (
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <Label>Color Theme</Label>
                      <p className="text-muted-foreground">
                        Choose your preferred color theme
                      </p>
                    </div>
                    <ColorSwitcher isPro />
                  </div>
                )}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <Label>Sound Effects</Label>
                    <p className="text-muted-foreground">
                      Enable sound effects during exercises
                    </p>
                  </div>
                  <SoundToggle
                    initialSoundEnabled={userSoundPreference.soundEnabled}
                  />
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
                    <p className="text-muted-foreground">
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

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <Label>Connected Account</Label>
                    <p className="text-muted-foreground">Google Account</p>
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
        </div>
      </FeedWrapper>
    </div>
  )
}

export default Page
