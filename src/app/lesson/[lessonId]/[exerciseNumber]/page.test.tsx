import Page from "./page" // Assuming default export
import { auth } from "@/auth"
import {
  getExerciseMetaByLessonAndNumber,
  getExerciseByLessonAndNumber,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries"
import { resetUserExerciseChallengeSubset } from "@/db/queries/user-progress"
import { redirect } from "next/navigation"
import { logger } from "@/lib/logger"

// --- Mocks ---
jest.mock("@/auth")
jest.mock("@/db/queries", () => ({
  getExerciseMetaByLessonAndNumber: jest.fn(),
  getExerciseByLessonAndNumber: jest.fn(),
  getUserProgress: jest.fn(),
  getUserSubscription: jest.fn(),
}))
jest.mock("@/db/queries/user-progress", () => ({
  resetUserExerciseChallengeSubset: jest.fn(),
}))
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}))
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}))
// Mock QuizWrapper as its internals are not tested here
jest.mock("@/app/lesson/components/quiz-wrapper", () => ({
  QuizWrapper: jest.fn(() => <div data-testid="quiz-wrapper" />),
}))

describe("Lesson Page - Exercise Reset Logic", () => {
  const mockUserId = "user_abc_123"
  const mockLessonId = "1"
  const mockExerciseNumber = "1"
  const mockExerciseId = 101

  const defaultPageParams = {
    lessonId: mockLessonId,
    exerciseNumber: mockExerciseNumber,
  }
  const defaultUserProgress = { gems: 5, points: 100, activeCourseId: 1 }
  const defaultExerciseData = {
    id: mockExerciseId,
    lessonId: parseInt(mockLessonId),
    title: "Test Exercise",
    exercise_number: parseInt(mockExerciseNumber),
    isTimed: false, // Default non-timed
    challenges: [], // Simplified
    lesson: { id: parseInt(mockLessonId), title: "Test Lesson" },
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default successful mock implementations
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } })
    ;(getExerciseMetaByLessonAndNumber as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: false, // Default to non-timed
    })
    ;(getExerciseByLessonAndNumber as jest.Mock).mockResolvedValue(defaultExerciseData)
    ;(getUserProgress as jest.Mock).mockResolvedValue(defaultUserProgress)
    ;(getUserSubscription as jest.Mock).mockResolvedValue(null)
    ;(resetUserExerciseChallengeSubset as jest.Mock).mockResolvedValue(undefined)
  })

  test("Timed, Non-Practice: resetUserExerciseChallengeSubset IS called", async () => {
    ;(getExerciseMetaByLessonAndNumber as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: true, // Key for this test
    })

    await Page({ params: Promise.resolve(defaultPageParams), searchParams: Promise.resolve({}) })

    expect(resetUserExerciseChallengeSubset).toHaveBeenCalledWith(mockUserId, mockExerciseId)
    expect(logger.info).toHaveBeenCalledWith(
      `Resetting challenge subset for user ${mockUserId}, timed exercise ${mockExerciseId}.`
    )
    expect(getExerciseByLessonAndNumber).toHaveBeenCalled() // Ensure full data fetch happens after
  })

  test("Timed, Practice: resetUserExerciseChallengeSubset IS NOT called", async () => {
    ;(getExerciseMetaByLessonAndNumber as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: true,
    })

    await Page({
      params: Promise.resolve(defaultPageParams),
      searchParams: Promise.resolve({ isPractice: "true" }), // Practice mode
    })

    expect(resetUserExerciseChallengeSubset).not.toHaveBeenCalled()
  })

  test("Non-Timed, Non-Practice: resetUserExerciseChallengeSubset IS NOT called", async () => {
    // getExerciseMetaByLessonAndNumber already defaults to isTimed: false
    await Page({ params: Promise.resolve(defaultPageParams), searchParams: Promise.resolve({}) })
    expect(resetUserExerciseChallengeSubset).not.toHaveBeenCalled()
  })

  test("User Not Logged In (Timed): resetUserExerciseChallengeSubset IS NOT called", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null) // No user
    ;(getExerciseMetaByLessonAndNumber as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: true,
    })

    await Page({ params: Promise.resolve(defaultPageParams), searchParams: Promise.resolve({}) })
    expect(resetUserExerciseChallengeSubset).not.toHaveBeenCalled()
  })

  test("Exercise Meta Not Found: Redirects to /learn", async () => {
    ;(getExerciseMetaByLessonAndNumber as jest.Mock).mockResolvedValue(null)

    await Page({ params: Promise.resolve(defaultPageParams), searchParams: Promise.resolve({}) })

    expect(redirect).toHaveBeenCalledWith("/learn")
    expect(logger.error).toHaveBeenCalledWith(
      `Exercise meta not found for lesson ${mockLessonId}, exercise ${mockExerciseNumber}. Redirecting to /learn.`
    )
  })

  test("Full Exercise Data Not Found (after meta): Redirects to /learn", async () => {
    ;(getExerciseByLessonAndNumber as jest.Mock).mockResolvedValue(null) // Full exercise fetch fails

    await Page({ params: Promise.resolve(defaultPageParams), searchParams: Promise.resolve({}) })

    expect(redirect).toHaveBeenCalledWith("/learn")
    expect(logger.error).toHaveBeenCalledWith(
      `Exercise or user progress not found after full fetch for lesson ${mockLessonId}, exercise ${mockExerciseNumber}. Redirecting to /learn.`
    )
  })

  test("User Progress Not Found (after meta): Redirects to /learn", async () => {
    ;(getUserProgress as jest.Mock).mockResolvedValue(null) // User progress fetch fails

    await Page({ params: Promise.resolve(defaultPageParams), searchParams: Promise.resolve({}) })

    expect(redirect).toHaveBeenCalledWith("/learn")
     expect(logger.error).toHaveBeenCalledWith(
      `Exercise or user progress not found after full fetch for lesson ${mockLessonId}, exercise ${mockExerciseNumber}. Redirecting to /learn.`
    )
  })
  
  test("Ensure QuizWrapper receives correct props after reset logic", async () => {
    // This test ensures that even if reset happens, the flow continues to QuizWrapper
    const timedExerciseMeta = { id: mockExerciseId, isTimed: true };
    const timedExerciseFullData = { ...defaultExerciseData, isTimed: true };

    ;(getExerciseMetaByLessonAndNumber as jest.Mock).mockResolvedValue(timedExerciseMeta);
    ;(getExerciseByLessonAndNumber as jest.Mock).mockResolvedValue(timedExerciseFullData);


    await Page({ params: Promise.resolve(defaultPageParams), searchParams: Promise.resolve({}) })

    expect(resetUserExerciseChallengeSubset).toHaveBeenCalledWith(mockUserId, mockExerciseId);
    // @ts-ignore
    const QuizWrapperMock = require("@/app/lesson/components/quiz-wrapper").QuizWrapper;
    expect(QuizWrapperMock).toHaveBeenCalled();
    expect(QuizWrapperMock).toHaveBeenCalledWith(
        expect.objectContaining({
            initialExerciseId: mockExerciseId,
            initialIsTimed: true, // Crucially, this should reflect the actual exercise data
            initialExerciseChallenges: timedExerciseFullData.challenges,
            initialGems: defaultUserProgress.gems,
            initialPoints: defaultUserProgress.points,
        }),
        expect.anything() // Second argument for React components (context or ref)
    );
  })
})
