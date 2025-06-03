import { UserAvatar } from "@/components/user-avatar"
import { NameInput } from "@/app/(main)/settings/name-input"
import { SettingsCard } from "@/app/(main)/settings/settings-card"
import { LiaUserEditSolid } from "react-icons/lia"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Session } from "next-auth"

type ProfileCardProps = {
  session: Session | null
}

export function ProfileCard({ session }: ProfileCardProps) {
  return (
    <SettingsCard title="Profile">
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
          <div className="w-full sm:w-1/2 space-y-4">
            <NameInput defaultName={session?.user?.name || ""} />
            <p className="text-muted-foreground text-sm bg-muted py-2 px-4 rounded-3xl">
              {session?.user?.email || "No email provided"}
            </p>
            <Input
              id="birthday"
              type="date"
              defaultValue={session?.user?.birthdate || ""}
              className="rounded-3xl"
            />
            <Select defaultValue={session?.user?.gender || ""} name="gender">
              <SelectTrigger id="gender" className="rounded-3xl">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </SettingsCard>
  )
}
