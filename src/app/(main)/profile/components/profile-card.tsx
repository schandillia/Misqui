import { UserAvatar } from "@/components/user-avatar"
import { NameInput } from "@/app/(main)/profile/components/name-input"
import { LiaUserEditSolid } from "react-icons/lia"
import { Session } from "next-auth"
import { GenderSelect } from "@/app/(main)/profile/components/gender-select"
import { BirthdateSelection } from "@/app/(main)/profile/components/birthdate-selection"
import { FeedCard } from "@/components/feed-card"

type ProfileCardProps = {
  session: Session | null
}

export function ProfileCard({ session }: ProfileCardProps) {
  return (
    <FeedCard title="Profile">
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="relative group">
            <button className="focus:outline-none">
              <UserAvatar
                name={session?.user?.name}
                image={session?.user?.image}
                className="size-16 transition-transform group-hover:scale-105"
              />
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0
                  group-hover:opacity-100 rounded-full transition-opacity duration-200
                  cursor-pointer"
              >
                <LiaUserEditSolid className="text-white size-6" />
              </div>
            </button>
          </div>
          {/* Name, email, birthday, and gender */}
          <div className="w-full sm:w-1/2 space-y-2">
            {/* Name */}
            <NameInput defaultName={session?.user?.name || ""} />
            {/* Email */}
            <p className="text-muted-foreground text-sm bg-muted rounded-3xl ml-2">
              {session?.user?.email || "No email provided"}
            </p>
            {/* Birthdate */}
            <BirthdateSelection
              caption="Your birthday"
              className="h-10 normal-case border-2 border-muted font-normal"
            />
            {/* Gender */}
            <GenderSelect defaultValue={session?.user?.gender} />
          </div>
        </div>
      </div>
    </FeedCard>
  )
}
