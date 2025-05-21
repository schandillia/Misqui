import { resetUserExerciseChallengeSubset } from "./user-progress"
import { db } from "@/db/drizzle"
import { getOrCreateUserExerciseChallengeSubset } from "@/db/queries/exercises"
import { userExerciseChallengeSubset as userExerciseChallengeSubsetSchema } from "@/db/schema"
import { logger } from "@/lib/logger" // Assuming logger might be used, though not explicitly in this func

// --- Mocks ---
jest.mock("@/db/drizzle", () => {
  const originalModule = jest.requireActual("@/db/drizzle")
  return {
    ...originalModule, // Keep original exports like 'and', 'eq' if they are used by the tested function
    db: {
      ...originalModule.db,
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue({ rowCount: 1 }), // Simulate successful deletion
    },
  }
})

jest.mock("@/db/queries/exercises", () => ({
  getOrCreateUserExerciseChallengeSubset: jest.fn(),
}))

jest.mock("@/lib/logger", () => ({ // Mock logger if it were used
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}))

describe("resetUserExerciseChallengeSubset", () => {
  const mockUserId = "user_reset_test_001"
  const mockExerciseId = 789
  const mockNewSubset = [10, 20, 30] // Example new subset IDs

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock implementations
    ;(getOrCreateUserExerciseChallengeSubset as jest.Mock).mockResolvedValue(
      mockNewSubset
    )
    // Ensure db.delete().where() is freshly mocked for each test if needed for specific checks
    // For this simple case, the module-level mock might be enough.
    // @ts-ignore
    db.delete = jest.fn().mockReturnThis();
    // @ts-ignore
    db.where = jest.fn().mockResolvedValue({ rowCount: 1 });


  })

  test("should call db.delete with correct parameters", async () => {
    await resetUserExerciseChallengeSubset(mockUserId, mockExerciseId)

    expect(db.delete).toHaveBeenCalledWith(userExerciseChallengeSubsetSchema)
    // The actual `and(eq(...), eq(...), eq(...))` structure is hard to match directly without
    // also re-implementing it in the test or deeply inspecting mock calls.
    // We'll check that `where` was called, implying the conditions were passed to it.
    expect(db.where).toHaveBeenCalledTimes(1) 
    // A more specific check could be done if Drizzle's `SQL` objects were inspectable,
    // or by ensuring `and` and `eq` from drizzle-orm were called with expected args if they were spied upon.
  })

  test("should call getOrCreateUserExerciseChallengeSubset after deletion", async () => {
    // Make db.where a spy to check call order if needed, or assume chained calls happen sequentially
    const deletePromise = Promise.resolve({ rowCount: 1 })
    // @ts-ignore
    db.where = jest.fn().mockReturnValue(deletePromise)

    await resetUserExerciseChallengeSubset(mockUserId, mockExerciseId)

    // Ensure delete's promise resolves before the next call
    await deletePromise 

    expect(getOrCreateUserExerciseChallengeSubset).toHaveBeenCalledWith(
      mockUserId,
      mockExerciseId,
      false // isPractice should be false
    )
    expect(getOrCreateUserExerciseChallengeSubset).toHaveBeenCalledTimes(1)
  })

  test("should return the result of getOrCreateUserExerciseChallengeSubset", async () => {
    const result = await resetUserExerciseChallengeSubset(mockUserId, mockExerciseId)
    expect(result).toEqual(mockNewSubset)
  })
  
  test("db.delete and getOrCreateUserExerciseChallengeSubset are called in order", async () => {
    let callOrder: string[] = [];
    
    // @ts-ignore
    db.where = jest.fn().mockImplementation(() => {
      callOrder.push("delete.where");
      return Promise.resolve({ rowCount: 1 });
    });
    (getOrCreateUserExerciseChallengeSubset as jest.Mock).mockImplementation(() => {
      callOrder.push("getOrCreateUserExerciseChallengeSubset");
      return Promise.resolve(mockNewSubset);
    });

    await resetUserExerciseChallengeSubset(mockUserId, mockExerciseId);

    expect(callOrder).toEqual(["delete.where", "getOrCreateUserExerciseChallengeSubset"]);
  });
})
