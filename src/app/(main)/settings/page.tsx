import { HeaderSection } from "@/app/(main)/components/header-section"
import { getUserSubscription } from "@/db/queries"
import { getStats, getUserSoundPreference } from "@/db/queries"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import ThemeToggle from "@/components/theme/theme-toggle"
import ColorSwitcher from "@/components/theme/color-switcher"
import { SoundToggle } from "@/components/sound-toggle"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { SubscriptionButton } from "@/components/subscription-button"
import { UserStats } from "@/app/(main)/components/user-stats"
import { PromoCard } from "@/app/(main)/components/promo-card"
import { RightColumn } from "@/app/(main)/components/right-column"
import { Feed } from "@/app/(main)/components/feed"
import { logger } from "@/lib/logger"
import { MissionsCard } from "@/app/(main)/components/missions-card"
import { FeedCard } from "@/components/feed-card"

const Page = async () => {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    logger.warn("No authenticated user found for settings page")
    redirect("/")
  }

  const [stats, userSubscription, userSoundPreference] = await Promise.all([
    getStats().catch((error) => {
      logger.error("Error fetching stats", {
        error,
        userId,
        module: "settings",
      })
      return null
    }),
    getUserSubscription(userId).catch((error) => {
      logger.error("Error fetching subscription", {
        error,
        userId,
        module: "settings",
      })
      return null
    }),
    getUserSoundPreference().catch((error) => {
      logger.error("Error fetching sound preference", {
        error,
        userId,
        module: "settings",
      })
      return null
    }),
  ])

  if (!userSoundPreference || !stats) {
    logger.warn("Missing required data for settings page", {
      userId,
      hasStats: !!stats,
      hasSoundPreference: !!userSoundPreference,
      module: "settings",
    })
    redirect("/")
  }

  const isPro = !!userSubscription?.isActive

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
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
      <Feed>
        <div className="flex w-full flex-col items-center">
          <HeaderSection
            imageSrc="/images/icons/settings.svg"
            imageAlt="Settings"
            title="Settings"
            description="Manage your account settings and preferences"
          />

          <div className="w-full space-y-6 lg:space-y-8">
            {/* Preferences */}
            <FeedCard title="Preferences">
              <div className="space-y-6">
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
              </div>
            </FeedCard>

            {/* Subscription Management */}
            <FeedCard title="Subscription">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <p className="text-muted-foreground">
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </p>
                </div>
                <SubscriptionButton
                  isPro={isPro}
                  proVariant="ghost"
                  nonProVariant="ghost"
                  proLabel="Manage Subscription"
                  nonProLabel="Upgrade to Pro"
                />
              </div>
            </FeedCard>

            {/* Account Security */}
            <FeedCard title="Account Security">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <Label>Connected Account</Label>
                  <p className="text-muted-foreground">Google Account</p>
                </div>
                <Button variant="ghost" className="w-full sm:w-auto">
                  Manage
                </Button>
              </div>
            </FeedCard>

            {/* Data & Privacy */}
            <FeedCard title="Data & Privacy">
              <div className="space-y-4">
                <Button variant="ghost" className="w-full">
                  Export Data
                </Button>
                <Button variant="danger" className="w-full">
                  Delete Account
                </Button>
              </div>
            </FeedCard>
          </div>
        </div>
      </Feed>
    </div>
  )
}

export default Page
