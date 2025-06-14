export const getDrillResultMessage = (
  isTimed: boolean,
  scorePercentage: number,
  timeTaken: number,
  expectedTime: number
) => {
  const showGreatJob = scorePercentage >= 90

  let resultMessage = ""
  if (isTimed) {
    if (scorePercentage >= 90) {
      resultMessage = "You aced the timed drill!"
    } else if (scorePercentage >= 70) {
      resultMessage = "Nice work on the timed drill!"
    } else {
      resultMessage = "Timed drill complete!"
    }
  } else {
    if (scorePercentage >= 90) {
      resultMessage = "You nailed the drill!"
    } else if (scorePercentage >= 70) {
      resultMessage = "Good job on the drill!"
    } else {
      resultMessage = "Drill complete!"
    }
  }

  // Adjust message based on time performance for timed drills
  if (isTimed && timeTaken > expectedTime * 1.5) {
    resultMessage += " Try to be faster next time."
  } else if (isTimed && timeTaken < expectedTime * 0.75) {
    resultMessage += " Wow, that was quick!"
  }

  return { resultMessage, showGreatJob }
}

export const getDrillTimeCaption = (
  timeTaken: number,
  expectedTime: number
) => {
  if (timeTaken > expectedTime * 1.5) {
    return "Slow"
  } else if (timeTaken < expectedTime * 0.75) {
    return "Fast"
  }
  return "Time"
}

export const getDrillTimeStatus = (
  timeTaken: number,
  expectedTime: number,
  scorePercentage: number
) => {
  if (scorePercentage < 70) {
    return "Keep practicing to improve your score!"
  }
  if (timeTaken > expectedTime * 1.5) {
    return "Your time was a bit slow. Try to speed up!"
  } else if (timeTaken < expectedTime * 0.75) {
    return "Blazing fast time! Well done!"
  }
  return "Solid performance! Keep it up!"
}
