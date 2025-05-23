import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import app from "@/lib/data/app.json"
import { Progress } from "@/components/ui/progress"
import { CardTitle } from "@/components/ui/card"
import { SidebarCard } from "@/components/sidebar-card"

const missions = app.MISSIONS
const missionsToDisplay = 3

type Props = {
  points: number
}

export const Missions = ({ points }: Props) => {
  return (
    <SidebarCard>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Image
            src="/images/icons/missions.svg"
            alt="Missions"
            height={26}
            width={26}
            className="self-center"
          />
          <CardTitle className="text-lg font-bold dark:text-neutral-300">
            Missions
          </CardTitle>
        </div>
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
    </SidebarCard>
  )
}
