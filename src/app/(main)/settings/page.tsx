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
import { SoundToggle } from "@/components/sound-toggle"
import { NameInput } from "@/app/(main)/settings/name-input"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SettingsCard } from "@/app/(main)/settings/settings-card"
import { Button } from "@/components/ui/button"
import { SubscriptionButton } from "@/components/subscription-button"

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
            imageAlt="Settings"
            title="Settings"
            description="Manage your account settings and preferences"
          />

          <div className="w-full space-y-6 lg:space-y-8">
            {/* Profile Information */}
            <SettingsCard title="Profile">
              <div className="space-y-6">
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
                  <NameInput defaultName={session?.user?.name || ""} />
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      defaultValue={session?.user?.email || ""}
                      disabled
                      className="rounded-3xl"
                    />
                  </div>
                </div>
              </div>
            </SettingsCard>

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
                  <SoundToggle
                    initialSoundEnabled={userSoundPreference.soundEnabled}
                  />
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
      </FeedWrapper>
    </div>
  )
}

export default Page
