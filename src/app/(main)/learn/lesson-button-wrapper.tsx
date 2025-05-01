import { ReactNode } from "react"

type Props = {
  index: number
  totalCount: number
  isCompleted: boolean
  children: ReactNode
}

export const LessonButtonWrapper = ({
  index,
  isCompleted,
  children,
}: Props) => {
  const cycleLength = 8
  const cycleIndex = index % cycleLength

  let indentationLevel: number

  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex
  } else {
    indentationLevel = cycleIndex - 8
  }

  const rightPosition = indentationLevel * 40
  const isFirst = index === 0

  return (
    <div
      className="relative"
      style={{
        right: `${rightPosition}px`,
        marginTop: isFirst && !isCompleted ? 60 : 24,
      }}
    >
      {children}
    </div>
  )
}
