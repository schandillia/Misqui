// @/app/lesson/utils/quiz-utils.ts

/**
 * Computes the time caption based on time taken relative to expected time.
 * @param timeTaken - Time taken in seconds.
 * @param expectedTime - Expected time in seconds.
 * @returns "Quick" | "Steady" | "Slow"
 */
export const getTimeCaption = (
  timeTaken: number,
  expectedTime: number
): "Quick" | "Steady" | "Slow" => {
  if (timeTaken < expectedTime) return "Quick"
  if (timeTaken <= expectedTime * 1.05) return "Steady"
  return "Slow"
}

/**
 * Computes the time status message based on time taken and score percentage.
 * @param timeTaken - Time taken in seconds.
 * @param expectedTime - Expected time in seconds.
 * @param scorePercentage - Score percentage (0-100).
 * @returns A descriptive time status message.
 */
export const getTimeStatus = (
  timeTaken: number,
  expectedTime: number,
  scorePercentage: number
): string => {
  if (timeTaken < expectedTime * 0.7) {
    if (scorePercentage < 60) return "Rushed Through! Try a steadier pace."
    if (scorePercentage >= 80) return "Lightning Pace! Stellar work!"
    return "Swift Pace! Nice speed!"
  }
  if (timeTaken < expectedTime * 0.85) {
    if (scorePercentage < 60) return "Rushed Through! Try a steadier pace."
    return "Swift Pace! Nice speed!"
  }
  if (timeTaken < expectedTime * 0.95) {
    return "Great Pace! Solid effort!"
  }
  if (timeTaken <= expectedTime * 1.05) {
    return "Steady Pace! Right on track!"
  }
  if (timeTaken <= expectedTime * 1.2) {
    if (scorePercentage >= 60) return "Thoughtful Pace! Careful and strong!"
    return "Leisurely Pace! Take your time, you’ve got this!"
  }
  return "Leisurely Pace! Take your time, you’ve got this!"
}

/**
 * Computes the result message and whether to show "Great job!" for the quiz result screen.
 * @param isTimed - Whether the exercise is timed.
 * @param scorePercentage - Score percentage (0-100).
 * @param timeTaken - Time taken in seconds.
 * @param expectedTime - Expected time in seconds.
 * @returns An object with resultMessage and showGreatJob.
 */
export const getResultMessage = (
  isTimed: boolean,
  scorePercentage: number,
  timeTaken: number,
  expectedTime: number
): { resultMessage: string; showGreatJob: boolean } => {
  let resultMessage = ""
  let showGreatJob = true

  if (isTimed) {
    if (scorePercentage < 100 || timeTaken > expectedTime) {
      resultMessage = "You did not pass the test."
      showGreatJob = false
    } else {
      resultMessage = "You’ve completed the test!"
      showGreatJob = true
    }
  } else {
    resultMessage = "You’ve completed the exercise."
    showGreatJob = true
  }

  return { resultMessage, showGreatJob }
}
