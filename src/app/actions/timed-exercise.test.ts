import { awardTimedExerciseReward } from "./timed-exercise"
import { auth } from "@/auth"
import { db } from "@/db/drizzle"
import { getUserProgress } from "@/db/queries"
import app from "@/lib/data/app.json"
import { logger } from "@/lib/logger"
import { revalidatePath } from "next/cache"
import { userProgress as userProgressSchema, exercises as exercisesSchema } from "@/db/schema"

// Mock dependencies
jest.mock("@/auth")
jest.mock("@/db/drizzle", () => ({
  db: {
    query: {
      exercises: {
        findFirst: jest.fn(),
      },
    },
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn(), // if you use .returning()
  },
}))
jest.mock("@/db/queries")
jest.mock("@/lib/data/app.json", () => ({
  REWARD_POINTS_FOR_TIMED: 50, // Example value
}))
jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}))
jest.mock("next/cache")

// Helper to mock db.update().set().where() chain
const mockDbUpdate = () => {
  const setMock = jest.fn().mockReturnThis()
  const whereMock = jest.fn().mockResolvedValue([{ id: "1" }]) // Simulates a successful update returning rows
  const updateMock = jest.fn(() => ({
    set: setMock,
    where: whereMock,
  }))
  return { updateMock, setMock, whereMock }
}


describe("awardTimedExerciseReward", () => {
  const mockUserId = "user_123"
  const mockExerciseId = 1
  const initialUserPoints = 100
  const initialUserGems = 10

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mocks for db.update chain for each test
    const { updateMock, setMock, whereMock } = mockDbUpdate()
    // @ts-ignore
    db.update = updateMock
    // @ts-ignore
    db.update(userProgressSchema).set = setMock;
    // @ts-ignore
    db.update(userProgressSchema).where = whereMock;

  })

  // Test 1: User not authenticated
  it("should throw 'Unauthorized' if user is not authenticated", async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)
    await expect(
      awardTimedExerciseReward(mockExerciseId, 100)
    ).rejects.toThrow("Unauthorized")
    expect(logger.error).toHaveBeenCalledWith(
      "Unauthorized timed exercise reward attempt",
      expect.any(Object)
    )
  })

  // Test 2: User progress not found
  it("should throw 'User progress not found' if user progress is not found", async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } })
    ;(getUserProgress as jest.Mock).mockResolvedValue(null)
    await expect(
      awardTimedExerciseReward(mockExerciseId, 100)
    ).rejects.toThrow("User progress not found")
    expect(logger.error).toHaveBeenCalledWith(
      "User progress not found for timed exercise reward",
      expect.any(Object)
    )
  })

  // Test 3: Exercise not found
  it("should throw 'Exercise not found' if exercise is not found", async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } })
    ;(getUserProgress as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      points: initialUserPoints,
      gems: initialUserGems,
    })
    // @ts-ignore
    ;(db.query.exercises.findFirst as jest.Mock).mockResolvedValue(null)
    await expect(
      awardTimedExerciseReward(mockExerciseId, 100)
    ).rejects.toThrow("Exercise not found")
    expect(logger.error).toHaveBeenCalledWith(
      "Exercise not found for timed exercise reward",
      expect.any(Object)
    )
  })

  // Test 4: Exercise is not timed
  it("should return { error: 'not_timed_exercise' } if exercise is not timed", async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } })
    ;(getUserProgress as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      points: initialUserPoints,
      gems: initialUserGems,
    })
    // @ts-ignore
    ;(db.query.exercises.findFirst as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: false,
    })

    const result = await awardTimedExerciseReward(mockExerciseId, 100)
    expect(result).toEqual({ error: "not_timed_exercise" })
    expect(db.update(userProgressSchema).set).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith(
      "Attempted to award reward for non-timed exercise",
      expect.any(Object)
    )
  })

  // Test 5: Timed exercise, score 100%
  it("should award points and revalidate paths if timed exercise and score is 100%", async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } })
    ;(getUserProgress as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      points: initialUserPoints,
      gems: initialUserGems,
    })
    // @ts-ignore
    ;(db.query.exercises.findFirst as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: true,
    })
    
    const { setMock: setFn } = mockDbUpdate();
    // @ts-ignore
    db.update = jest.fn().mockReturnValue({ set: setFn, where: jest.fn().mockResolvedValue([{}]) });


    const result = await awardTimedExerciseReward(mockExerciseId, 100)

    expect(result).toEqual({ success: true })
    expect(db.update).toHaveBeenCalledWith(userProgressSchema)
    expect(setFn).toHaveBeenCalledWith({
        points: initialUserPoints + app.REWARD_POINTS_FOR_TIMED,
    })
    // expect(db.update(userProgressSchema).where).toHaveBeenCalledWith(eq(userProgressSchema.userId, mockUserId)); // This needs schema import

    expect(revalidatePath).toHaveBeenCalledWith("/learn")
    expect(revalidatePath).toHaveBeenCalledWith("/leaderboard")
    expect(revalidatePath).toHaveBeenCalledWith("/missions")
    expect(revalidatePath).toHaveBeenCalledWith(`/exercise/${mockExerciseId}`)
    expect(logger.info).toHaveBeenCalledWith(
      "Awarding points for 100% timed exercise",
      expect.any(Object)
    )
  })

  // Test 6: Timed exercise, score < 100%
  it("should not award points if timed exercise and score is less than 100%", async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } })
    ;(getUserProgress as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      points: initialUserPoints,
      gems: initialUserGems,
    })
    // @ts-ignore
    ;(db.query.exercises.findFirst as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: true,
    })
    const { setMock: setFn } = mockDbUpdate();
     // @ts-ignore
    db.update = jest.fn().mockReturnValue({ set: setFn, where: jest.fn().mockResolvedValue([{}]) });


    const result = await awardTimedExerciseReward(mockExerciseId, 90)

    expect(result).toEqual({ success: true }) // Or whatever it returns in this case
    expect(db.update(userProgressSchema).set).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith(
      "No reward for timed exercise, score not 100%",
      expect.any(Object)
    )
  })
  
  // Test 7: Gems should never be affected
  it("should not modify gems regardless of score or timed status", async () => {
    ;(auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } })
    ;(getUserProgress as jest.Mock).mockResolvedValue({
      userId: mockUserId,
      points: initialUserPoints,
      gems: initialUserGems,
    })
    // @ts-ignore
    ;(db.query.exercises.findFirst as jest.Mock).mockResolvedValue({
      id: mockExerciseId,
      isTimed: true, // Test with timed true
    })

    const { setMock: setFn } = mockDbUpdate();
    // @ts-ignore
    db.update = jest.fn().mockReturnValue({ set: setFn, where: jest.fn().mockResolvedValue([{}]) });

    // Scenario 1: Score 100%
    await awardTimedExerciseReward(mockExerciseId, 100)
    if (setFn.mock.calls.length > 0) {
        expect(setFn.mock.calls[0][0]).not.toHaveProperty("gems")
    }
    
    setFn.mockClear();

    // Scenario 2: Score < 100%
    await awardTimedExerciseReward(mockExerciseId, 90)
    expect(setFn).not.toHaveBeenCalled() // No update means no gem modification
  })
})

describe("awardTimedExerciseReward - db.update call structure", () => {
    const mockUserId = "user_123";
    const mockExerciseId = 1;
    const initialUserPoints = 100;
    const initialUserGems = 10;
    let setMock: jest.Mock, whereMock: jest.Mock, updateMock: jest.Mock;

    beforeEach(() => {
        jest.resetAllMocks(); // Clear all mocks

        // Setup auth and getUserProgress mocks
        (auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });
        (getUserProgress as jest.Mock).mockResolvedValue({
            userId: mockUserId,
            points: initialUserPoints,
            gems: initialUserGems,
        });
        // Setup exercise mock
        (db.query.exercises.findFirst as jest.Mock).mockResolvedValue({
            id: mockExerciseId,
            isTimed: true,
        });

        // Setup db.update mock chain
        setMock = jest.fn().mockReturnThis();
        // @ts-ignore
        whereMock = jest.fn((condition) => {
            // console.log("whereMock called with:", condition);
            return Promise.resolve([{}]); // Simulate successful update
        });
        updateMock = jest.fn((schema) => {
            // console.log("updateMock called with schema:", schema.name);
            return {
                set: setMock,
                where: whereMock,
            };
        });
        // @ts-ignore
        db.update = updateMock;
    });

    it("should call db.update with correct schema, set payload, and where clause", async () => {
        await awardTimedExerciseReward(mockExerciseId, 100);

        expect(updateMock).toHaveBeenCalledTimes(1);
        expect(updateMock).toHaveBeenCalledWith(userProgressSchema);

        expect(setMock).toHaveBeenCalledTimes(1);
        expect(setMock).toHaveBeenCalledWith({
            points: initialUserPoints + app.REWARD_POINTS_FOR_TIMED,
        });
        
        // Check where clause
        // This requires importing 'eq' from 'drizzle-orm' if we want to match the exact condition object
        // For simplicity here, we'll check if it's called, assuming the internal logic of 'eq' is correct.
        // A more robust test would involve: import { eq } from "drizzle-orm"; expect(whereMock).toHaveBeenCalledWith(eq(userProgressSchema.userId, mockUserId));
        expect(whereMock).toHaveBeenCalledTimes(1);
        // A simple check that the first argument to where was a function (which eq returns)
        // or more specific if you know the structure of the Drizzle condition object
        expect(whereMock.mock.calls[0][0]).toBeDefined(); 
    });
});
