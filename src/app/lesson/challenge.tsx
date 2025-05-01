import { ChallengeCard } from "@/app/lesson/challenge-card"
import { challengeOptions, challenges } from "@/db/schema"
import { cn } from "@/lib/utils"

type Props = {
  options: (typeof challengeOptions.$inferSelect)[]
  onSelect: (id: number) => void
  status: "correct" | "wrong" | "none"
  selectedOption?: number
  disabled?: boolean
  challengeType: (typeof challenges.$inferSelect)["challengeType"]
}

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  challengeType,
}: Props) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {options.map((option, i) => (
        <ChallengeCard
          key={option.id}
          id={option.id}
          text={option.text}
          image={option.image}
          audio={option.audio}
          shortcut={`${i + 1}`}
          selected={selectedOption === option.id}
          onClick={() => onSelect(option.id)}
          status={status}
          disabled={disabled}
          challengeType={challengeType} // Add this prop back
        />
      ))}
    </div>
  )
}
