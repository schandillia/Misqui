import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import app from "@/lib/data/app.json"
import { Progress } from "@/components/ui/progress"

const missions = app.MISSIONS

const missionsToDisplay = 3

type Props = {
  points: number
}

export const Missions = ({ points }: Props) => {
  return (
    <div className="space-y-4 rounded-3xl border-1 p-4 shadow-md shadow-neutral-500 dark:border-2 dark:shadow-neutral-800">
      <div className="flex w-full items-center justify-between space-y-2">
        <h3 className="text-lg font-bold dark:text-neutral-300">Missions</h3>
        <Link href="/missions">
          <Button size="sm" variant="primaryOutline">
            View all
          </Button>
        </Link>
      </div>
      <ul className="w-full space-y-4">
        {missions
          .filter((mission) => (points / mission.VALUE) * 100 < 100) // Filter incomplete missions
          .slice(0, missionsToDisplay)
          .map((mission) => {
            const progress = (points / mission.VALUE) * 100
            return (
              <div
                key={mission.TITLE}
                className="flex w-full items-center gap-x-3 pb-4"
              >
                <Image
                  src="/images/icons/points.svg"
                  width={40}
                  height={40}
                  alt="Points"
                />
                <div className="flex w-full flex-col gap-y-2">
                  <p className="text-sm font-bold text-neutral-700 dark:text-neutral-400">
                    {mission.TITLE}
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
