import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import app from "@/lib/data/app.json"
import { Progress } from "@/components/ui/progress"

const quests = app.QUESTS

type Props = {
  points: number
}

export const Quests = ({ points }: Props) => {
  return (
    <div className="rounded-xl p-4 border-2 space-y-4">
      <div className="flex items-center justify-between w-full space-y-2">
        <h3 className="font-bold text-lg">Quests</h3>
        <Link href="/quests">
          <Button size="sm" variant="primaryOutline">
            View all
          </Button>
        </Link>
      </div>
      <ul className="w-full space-y-4">
        {quests.map((quest) => {
          const progress = (points / quest.VALUE) * 100
          return (
            <div
              key={quest.TITLE}
              className="flex items-center w-full pb-4 gap-x-3"
            >
              <Image src="/points.svg" width={40} height={40} alt="Points" />
              <div className="flex flex-col w-full gap-y-2">
                <p className="text-neutral-700 font-bold text-sm">
                  {quest.TITLE}
                </p>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          )
        })}
      </ul>
    </div>
  )
}
