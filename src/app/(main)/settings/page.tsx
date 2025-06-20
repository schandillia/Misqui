import { HeaderSection } from "@/app/(main)/components/header-section"
import { getStats, getUserData } from "@/db/queries"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import ThemeToggle from "@/components/theme/theme-toggle"
import ColorSwitcher from "@/components/theme/color-switcher"
import { SoundToggle } from "@/components/sound-toggle"
import { ProfileCard } from "@/app/(main)/settings/components/profile-card"
import { Label } from "@/components/ui/label"
import { SettingsCard } from "@/app/(main)/settings/components/settings-card"
import { Button } from "@/components/ui/button"
import { SubscriptionButton } from "@/components/subscription-button"
import { UserStats } from "@/app/(main)/components/user-stats"
import { PromoCard } from "@/app/(main)/components/promo-card"
import { RightColumn } from "@/app/(main)/components/right-column"
import { Feed } from "@/app/(main)/components/feed"

const Page = async () => {
  const sessionData = auth()
  const statsData = getStats()
  const userData = getUserData()

  const [session, stats, data] = await Promise.all([
    sessionData,
    statsData,
    userData,
  ])

  if (!stats || !stats.activeCourse) redirect("/courses")
  if (!data) redirect("/")

  const { soundEnabled, subscription } = data

  const isPro = !!subscription?.isActive

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
            {/* Profile Information */}
            <ProfileCard session={session} />

            {/* Preferences */}
            <SettingsCard title="Preferences">
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
                  <SoundToggle initialSoundEnabled={soundEnabled} />
                </div>
              </div>
            </SettingsCard>

            {/* Subscription Management */}
            <SettingsCard title="Subscription">
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
            </SettingsCard>

            {/* Account Security */}
            <SettingsCard title="Account Security">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <Label>Connected Account</Label>
                  <p className="text-muted-foreground">Google Account</p>
                </div>
                <Button variant="ghost" className="w-full sm:w-auto">
                  Manage
                </Button>
              </div>
            </SettingsCard>

            {/* Data & Privacy */}
            <SettingsCard title="Data & Privacy">
              <div className="space-y-4">
                <Button variant="ghost" className="w-full">
                  Export Data
                </Button>
                <Button variant="danger" className="w-full">
                  Delete Account
                </Button>
              </div>
            </SettingsCard>
          </div>
        </div>
      </Feed>
    </div>
  )
}

export default Page
