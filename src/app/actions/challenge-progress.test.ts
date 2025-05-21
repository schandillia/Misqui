import { upsertChallengeProgress } from "./challenge-progress"
import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import {
  getUserProgress,
  getUserSubscription,
  markExerciseCompleteAndUpdateStreak,
} from "@/db/queries"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import {
  userProgress as userProgressSchema,
  exercises as exercisesSchema,
  challenges as challengesSchema,
  challengeProgress as challengeProgressSchema,
} from "@/db/schema"

// Mock dependencies
jest.mock("@/auth")
jest.mock("@/db/drizzle", () => ({
  db: {
    query: {
      challenges: { findFirst: jest.fn() },
      exercises: { findFirst: jest.fn() }, // Added for exercise fetch
      challengeProgress: { findFirst: jest.fn() },
    },
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(), // For insert
    set: jest.fn().mockReturnThis(),    // For update
    where: jest.fn().mockReturnThis(),
    onConflictDoUpdate: jest.fn().mockReturnThis(), // For practice mode upsert
  },
}))
jest.mock("@/db/queries", () => ({
  getUserProgress: jest.fn(),
  getUserSubscription: jest.fn(),
  markExerciseCompleteAndUpdateStreak: jest.fn(),
}))
jest.mock("@/lib/data/app.json", () => ({
  POINTS_PER_CHALLENGE: 10,
  GEMS_LIMIT: 5, // Example value
}))
jest.mock("@/lib/logger") // Auto-mocked
jest.mock("next/cache") // Auto-mocked

// Helper for db.update().set().where() chain
const mockDbUpdateChain = (targetSchema?: any) => {
  const setMock = jest.fn().mockReturnThis();
  const whereMock = jest.fn().mockResolvedValue([{}]); // Simulate successful update
  const updateMock = jest.fn((schema) => {
    // if (targetSchema) expect(schema).toBe(targetSchema);
    return { set: setMock, where: whereMock };
  });
  return { updateMock, setMock, whereMock };
}

// Helper for db.insert().values() chain
const mockDbInsertChain = (targetSchema?: any) => {
  const valuesMock = jest.fn().mockReturnThis();
  const insertMock = jest.fn((schema) => {
    // if (targetSchema) expect(schema).toBe(targetSchema);
    return { values: valuesMock };
  });
  return { insertMock, valuesMock };
}


describe("upsertChallengeProgress", () => {
  const mockUserId = "user_test_123"
  const mockChallengeId = 101
  const mockExerciseId = 202
  const initialUserPoints = 50
  const initialUserGems = 3

  let dbUpdateSetMock: jest.Mock
  let dbUpdateWhereMock: jest.Mock
  let dbUpdateMock: jest.Mock
  let dbInsertValuesMock: jest.Mock
  let dbInsertMock: jest.Mock


  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks for successful operations
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } })
    ;(getUserProgress as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      points: initialUserPoints,
      gems: initialUserGems,
      activeCourseId: 1, // Or whatever is needed
    })
    ;(getUserSubscription as jest.Mock).mockResolvedValue(null) // No active subscription by default
    ;(db.query.challenges.findFirst as jest.Mock).mockResolvedValue({
      id: mockChallengeId,
      exerciseId: mockExerciseId,
      type: "SELECT",
    })
    // Default to non-timed exercise
    ;(db.query.exercises.findFirst as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: false,
    })
    // Default to not a practice session (no existing challenge progress)
    ;(db.query.challengeProgress.findFirst as jest.Mock).mockResolvedValue(null)

    // Mock db update and insert chains
    const updateChain = mockDbUpdateChain();
    dbUpdateMock = updateChain.updateMock;
    dbUpdateSetMock = updateChain.setMock;
    dbUpdateWhereMock = updateChain.whereMock;
     // @ts-ignore
    db.update = dbUpdateMock;


    const insertChain = mockDbInsertChain();
    dbInsertMock = insertChain.insertMock;
    dbInsertValuesMock = insertChain.valuesMock;
     // @ts-ignore
    db.insert = dbInsertMock;
  })

  // Scenario: Non-timed exercise, non-practice
  it("should award points and mark complete for non-timed, non-practice challenge", async () => {
    await upsertChallengeProgress(mockChallengeId)

    expect(db.insert).toHaveBeenCalledWith(challengeProgressSchema)
    expect(dbInsertValuesMock).toHaveBeenCalledWith({
      challengeId: mockChallengeId,
      userId: mockUserId,
      completed: true,
    })
    expect(db.update).toHaveBeenCalledWith(userProgressSchema)
    expect(dbUpdateSetMock).toHaveBeenCalledWith({
      points: initialUserPoints + app.POINTS_PER_CHALLENGE,
    })
    expect(markExerciseCompleteAndUpdateStreak).toHaveBeenCalledWith(
      mockUserId,
      mockExerciseId
    )
    expect(revalidatePath).toHaveBeenCalledWith("/learn") // And others
  })

  // Scenario: Timed exercise, non-practice
  it("should NOT award points but mark complete for timed, non-practice challenge", async () => {
    ;(db.query.exercises.findFirst as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: true, // Key change for this test
    })

    await upsertChallengeProgress(mockChallengeId)

    expect(db.insert).toHaveBeenCalledWith(challengeProgressSchema)
    expect(dbInsertValuesMock).toHaveBeenCalledWith({
      challengeId: mockChallengeId,
      userId: mockUserId,
      completed: true,
    })
    // Check that userProgress.points was NOT updated
    // This requires checking if db.update(userProgressSchema).set was called with points
    const userProgressUpdateCall = dbUpdateMock.mock.calls.find(call => call[0] === userProgressSchema);
    if (userProgressUpdateCall) { // If userProgress was updated for any reason (e.g. streak)
        const userProgressSetCall = dbUpdateSetMock.mock.calls.find(call => call[0].points !== undefined);
        expect(userProgressSetCall).toBeUndefined(); // No call should have set points
    } else {
        expect(db.update).not.toHaveBeenCalledWith(userProgressSchema); // Or no update at all if only points were to be set
    }


    expect(markExerciseCompleteAndUpdateStreak).toHaveBeenCalledWith(
      mockUserId,
      mockExerciseId
    )
  })

  // Scenario: Practice mode, non-timed exercise
  it("should award points and gems for practice, non-timed challenge", async () => {
    ;(db.query.challengeProgress.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      challengeId: mockChallengeId,
      userId: mockUserId,
      completed: false, // Existing progress, indicates practice
    })

    await upsertChallengeProgress(mockChallengeId)

    // Should update existing challengeProgress
    expect(db.update).toHaveBeenCalledWith(challengeProgressSchema)
    expect(dbUpdateSetMock).toHaveBeenCalledWith({ completed: true })
    
    // Should update userProgress with points and gems
    expect(db.update).toHaveBeenCalledWith(userProgressSchema)
    const userProgressSetArgs = dbUpdateSetMock.mock.calls.find(
        (call) => call[0].points !== undefined || call[0].gems !== undefined
    );
    expect(userProgressSetArgs[0]).toEqual({
      points: initialUserPoints + app.POINTS_PER_CHALLENGE,
      gems: Math.min(initialUserGems + 1, app.GEMS_LIMIT),
    })
    expect(markExerciseCompleteAndUpdateStreak).toHaveBeenCalled()
  })

  // Scenario: Practice mode, timed exercise
  it("should NOT award points/gems but mark complete for practice, timed challenge", async () => {
    ;(db.query.challengeProgress.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      challengeId: mockChallengeId,
      userId: mockUserId,
      completed: false,
    })
    ;(db.query.exercises.findFirst as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: true, // Timed exercise
    })

    await upsertChallengeProgress(mockChallengeId)

    expect(db.update).toHaveBeenCalledWith(challengeProgressSchema) // Marks challenge complete
    expect(dbUpdateSetMock).toHaveBeenCalledWith({ completed: true })

    // Check that userProgress.points and userProgress.gems were NOT updated
    const userProgressUpdateCall = dbUpdateMock.mock.calls.find(call => call[0] === userProgressSchema);
    if (userProgressUpdateCall) {
        const userProgressSetCallArgs = dbUpdateSetMock.mock.calls.find(call => call[0].points !== undefined || call[0].gems !== undefined);
        // If set was called, ensure it's an empty object or doesn't contain points/gems
        expect(userProgressSetCallArgs === undefined || Object.keys(userProgressSetCallArgs[0]).length === 0).toBe(true);
    } else {
         // This is also acceptable, meaning no update to userProgress happened.
        expect(db.update).not.toHaveBeenCalledWith(userProgressSchema);
    }


    expect(markExerciseCompleteAndUpdateStreak).toHaveBeenCalled()
  })

  // Scenario: No gems
  it("should return { error: 'gems' } if user has no gems (non-practice, no sub)", async () => {
    ;(getUserProgress as jest.Mock).mockResolvedValue({
      ... (await getUserProgress()),
      gems: 0,
    })
    // Not practice, no subscription by default

    const result = await upsertChallengeProgress(mockChallengeId)
    expect(result).toEqual({ error: "gems" })
    expect(db.insert).not.toHaveBeenCalled()
    expect(db.update).not.toHaveBeenCalledWith(userProgressSchema) // Or specific checks
  })
  
  // Scenario: Unauthorized
  it("should throw 'Unauthorized' if no session", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    await expect(upsertChallengeProgress(mockChallengeId)).rejects.toThrow("Unauthorized")
  })

  // Scenario: UserProgress not found
  it("should throw 'User progress not found' if !currentUserProgress", async () => {
    ;(getUserProgress as jest.Mock).mockResolvedValue(null)
    await expect(upsertChallengeProgress(mockChallengeId)).rejects.toThrow("User progress not found")
  })

  // Scenario: Challenge not found
  it("should throw 'Challenge not found' if !challenge", async () => {
    ;(db.query.challenges.findFirst as jest.Mock).mockResolvedValue(null)
    await expect(upsertChallengeProgress(mockChallengeId)).rejects.toThrow("Challenge not found")
  })

  // Scenario: Exercise not found
  it("should throw 'Exercise not found' if !exercise (new dependency)", async () => {
    ;(db.query.exercises.findFirst as jest.Mock).mockResolvedValue(null)
    await expect(upsertChallengeProgress(mockChallengeId)).rejects.toThrow("Exercise not found")
  })
})
