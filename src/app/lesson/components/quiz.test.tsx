import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import { Quiz } from "./quiz"
import { upsertChallengeProgress } from "@/app/actions/challenge-progress"
import { reduceGems } from "@/app/actions/user-progress"
import { awardTimedExerciseReward } from "@/app/actions/timed-exercise"
import { useGemsModal } from "@/store/use-gems-modal"
import { usePracticeModal } from "@/store/use-practice-modal"
import { useQuizAudio } from "@/store/use-quiz-audio"
import { toast } from "sonner"
import appConfig from "@/lib/data/app.json" // Import app config

// --- Mocks ---
jest.mock("@/app/actions/challenge-progress")
jest.mock("@/app/actions/user-progress")
jest.mock("@/app/actions/timed-exercise")
jest.mock("@/store/use-gems-modal")
jest.mock("@/store/use-practice-modal")
jest.mock("@/store/use-quiz-audio")

// Updated useRouter mock
const mockRouterPush = jest.fn()
const mockRouterRefresh = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: mockRouterRefresh,
  }),
}))
jest.mock("react-use", () => ({
  useWindowSize: () => ({ width: 1024, height: 768 }),
  useMount: (fn: () => void) => fn(), // Call on mount
}))
jest.mock("sonner", () => ({ toast: { error: jest.fn(), success: jest.fn() } }))

// Mock Child Components
jest.mock("@/app/lesson/components/exercise-header", () => ({
  ExerciseHeader: jest.fn(({ gems, percentage }) => (
    <div data-testid="exercise-header">
      Gems: {gems}, Percentage: {percentage}
    </div>
  )),
}))
jest.mock("@/app/lesson/components/question-bubble", () => ({
  QuestionBubble: jest.fn(() => <div data-testid="question-bubble" />),
}))
jest.mock("@/app/lesson/components/challenge", () => ({
  Challenge: jest.fn(({ onSelect, options, selectedOption, status }) => (
    <div data-testid="challenge">
      {options.map((opt: any) => (
        <button
          key={opt.id}
          data-testid={`option-${opt.id}`}
          onClick={() => onSelect(opt.id)}
          data-selected={selectedOption === opt.id}
          data-status={status}
        >
          {opt.text}
        </button>
      ))}
    </div>
  )),
}))
jest.mock("@/app/lesson/components/footer", () => ({
  Footer: jest.fn(({ onCheck, status, disabled }) => (
    <button
      data-testid="footer-check-button"
      onClick={onCheck}
      data-status={status}
      disabled={disabled}
    >
      {status === "correct" || status === "wrong" ? "Next" : "Check"}
    </button>
  )),
}))

// Updated ResultCard mock to capture props
const mockResultCard = jest.fn(() => <div data-testid="result-card-mock" />)
jest.mock("@/app/lesson/components/result-card", () => ({
  ResultCard: mockResultCard,
}))
jest.mock("react-confetti", () => jest.fn(() => null)) // Mock confetti

// --- Default Props ---
const defaultChallenge = {
  id: 1,
  exerciseId: 1,
  question: "Which is correct?",
  order: 1,
  challengeType: "SELECT",
  completed: false,
  challengeOptions: [
    { id: 10, challengeId: 1, text: "Option A", correct: true, audioSrc: "" },
    { id: 11, challengeId: 1, text: "Option B", correct: false, audioSrc: "" },
  ],
} as const

const defaultProps = {
  initialLessonId: 1,
  initialExerciseId: 1,
  initialGems: 5,
  initialPoints: 100,
  initialPercentage: 0,
  initialExerciseChallenges: [defaultChallenge],
  initialExerciseTitle: "Test Exercise",
  initialExerciseNumber: 1,
  initialIsTimed: false,
  userSubscription: null,
  isPractice: false,
}

describe("Quiz Component - Timed Exercises", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useGemsModal as jest.Mock).mockReturnValue({ open: jest.fn() })
    ;(usePracticeModal as jest.Mock).mockReturnValue({ open: jest.fn() })
    ;(useQuizAudio as jest.Mock).mockReturnValue({
      playCorrect: jest.fn(),
      playIncorrect: jest.fn(),
      playFinish: jest.fn(),
    })
    // Default mock for awardTimedExerciseReward
    ;(awardTimedExerciseReward as jest.Mock).mockResolvedValue({
      success: true,
      pointsAwarded: 0, // Default to 0 points awarded
    })
    ;(upsertChallengeProgress as jest.Mock).mockResolvedValue({})
    ;(reduceGems as jest.Mock).mockResolvedValue({})
    mockResultCard.mockClear() // Clear mock calls before each test
    mockRouterPush.mockClear()
    mockRouterRefresh.mockClear()
    ;(toast.success as jest.Mock).mockClear()
    ;(toast.error as jest.Mock).mockClear()
  })

  test("Timed Mode: Clicking 'Check' on wrong answer changes button to 'Next'", () => {
    render(<Quiz {...defaultProps} initialIsTimed={true} />)
    const wrongOptionButton = screen.getByTestId("option-11") // Option B (wrong)
    fireEvent.click(wrongOptionButton)
    const checkButton = screen.getByTestId("footer-check-button")
    fireEvent.click(checkButton)

    // Footer should now display "Next" because status is "wrong"
    expect(checkButton).toHaveTextContent("Next")
    expect(checkButton).toHaveAttribute("data-status", "wrong")
  })

  test("Timed Mode: Clicking 'Check' updates progress bar percentage", () => {
    render(<Quiz {...defaultProps} initialIsTimed={true} />)
    const header = screen.getByTestId("exercise-header")
    expect(header).toHaveTextContent("Percentage: 0")

    const correctOptionButton = screen.getByTestId("option-10") // Option A (correct)
    fireEvent.click(correctOptionButton)
    const checkButton = screen.getByTestId("footer-check-button")
    fireEvent.click(checkButton)

    // challenges.length is 1, so 100 / 1 = 100%
    expect(header).toHaveTextContent("Percentage: 100")
  })

  test("Timed Mode: No points or gems added/deducted locally", async () => {
    render(<Quiz {...defaultProps} initialIsTimed={true} initialGems={3} />)
    const header = screen.getByTestId("exercise-header")
    expect(header).toHaveTextContent("Gems: 3")

    const correctOptionButton = screen.getByTestId("option-10")
    fireEvent.click(correctOptionButton)
    const checkButton = screen.getByTestId("footer-check-button")
    
    await act(async () => {
      fireEvent.click(checkButton)
    })

    // Gems should remain the same
    expect(header).toHaveTextContent("Gems: 3")
    expect(upsertChallengeProgress).not.toHaveBeenCalled()
    expect(reduceGems).not.toHaveBeenCalled()
  })

  test("Timed Mode: Optimistically sets points, calls reward action (100% score, no success toast, router refresh)", async () => {
    // Mock awardTimedExerciseReward to return specific points for this test
    ;(awardTimedExerciseReward as jest.Mock).mockResolvedValue({
      success: true,
      pointsAwarded: appConfig.REWARD_POINTS_FOR_TIMED,
    })

    render(
      <Quiz
        {...defaultProps}
        initialIsTimed={true}
        initialExerciseChallenges={[defaultChallenge]} // Only one challenge
      />
    )

    const correctOptionButton = screen.getByTestId("option-10")
    fireEvent.click(correctOptionButton)
    const checkButton = screen.getByTestId("footer-check-button")
    
    await act(async () => {
      fireEvent.click(checkButton) // Status becomes "correct"
    })
    
    // Button is now "Next"
    expect(checkButton).toHaveTextContent("Next")
    
    await act(async () => {
      fireEvent.click(checkButton) // Click "Next" to complete
    })

    // Quiz should be completed now
    expect(awardTimedExerciseReward).toHaveBeenCalledTimes(1)
    expect(awardTimedExerciseReward).toHaveBeenCalledWith(defaultProps.initialExerciseId, 100)

    // Quiz should be completed now
    // Check for optimistic update BEFORE action resolves (though act makes it tricky)
    // The key is that setPointsEarned is called outside the async .then()
    const pointsCardCallOptimistic = mockResultCard.mock.calls.find(
      (call) => call[0].variant === "points"
    )
    expect(pointsCardCallOptimistic).toBeDefined()
    expect(pointsCardCallOptimistic?.[0].value).toBe(appConfig.REWARD_POINTS_FOR_TIMED)
    
    // Wait for the action to resolve
    await act(async () => {
      // This is just to ensure all promises resolve if any were pending from the last fireEvent
      // awardTimedExerciseReward was already called by the last fireEvent.
    });

    expect(awardTimedExerciseReward).toHaveBeenCalledTimes(1)
    expect(awardTimedExerciseReward).toHaveBeenCalledWith(defaultProps.initialExerciseId, 100)
    expect(toast.success).not.toHaveBeenCalledWith("Points awarded for perfect score!")

    // Verify ResultCard for points still shows the (now confirmed) awarded points
    const pointsCardCallConfirmed = mockResultCard.mock.calls.find(
      (call) => call[0].variant === "points"
    )
    expect(pointsCardCallConfirmed).toBeDefined()
    expect(pointsCardCallConfirmed?.[0].value).toBe(appConfig.REWARD_POINTS_FOR_TIMED)

    // Simulate clicking the "Continue" button on the results screen
    // The footer in completed state should be present.
    // Its onCheck prop is now `handleQuizCompleteContinue`
    const continueButton = screen.getByTestId("footer-check-button")
    expect(continueButton).toHaveAttribute("data-status", "completed") // Assuming Footer gets 'completed' status
    fireEvent.click(continueButton)
    expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledWith("/learn")
  })

  test("Timed Mode: Optimistically sets 0 points, calls reward action (<100% score, no success toast, router refresh)", async () => {
    // awardTimedExerciseReward mock already defaults to pointsAwarded: 0
    const challenges = [
      { ...defaultChallenge, id: 1, order: 1 },
      { ...defaultChallenge, id: 2, question: "Q2", order: 2, challengeOptions: [
        { id: 20, challengeId: 2, text: "Q2 Opt A", correct: true, audioSrc: "" },
        { id: 21, challengeId: 2, text: "Q2 Opt B", correct: false, audioSrc: "" },
      ]},
    ];
    render(
      <Quiz
        {...defaultProps}
        initialIsTimed={true}
        initialExerciseChallenges={challenges}
      />
    )

    // Challenge 1: Correct
    let correctOptionButton = screen.getByTestId("option-10")
    fireEvent.click(correctOptionButton)
    let checkButton = screen.getByTestId("footer-check-button")
    await act(async () => { fireEvent.click(checkButton) }); // Status = "correct"
    await act(async () => { fireEvent.click(checkButton) }); // Next

    // Challenge 2: Incorrect
    let wrongOptionButton = screen.getByTestId("option-21") // Q2 Option B (wrong)
    fireEvent.click(wrongOptionButton)
    checkButton = screen.getByTestId("footer-check-button")
    await act(async () => { fireEvent.click(checkButton) }); // Status = "wrong"
    await act(async () => { fireEvent.click(checkButton) }); // Next
    
    // Quiz should be completed now
    expect(awardTimedExerciseReward).toHaveBeenCalledTimes(1)
    expect(awardTimedExerciseReward).toHaveBeenCalledWith(defaultProps.initialExerciseId, 50)

    // Quiz should be completed now
    // Check for optimistic update (0 points)
    const pointsCardCallOptimistic = mockResultCard.mock.calls.find(
      (call) => call[0].variant === "points"
    )
    expect(pointsCardCallOptimistic).toBeDefined()
    expect(pointsCardCallOptimistic?.[0].value).toBe(0)

    await act(async () => { /* allow promises to settle */ });

    expect(awardTimedExerciseReward).toHaveBeenCalledTimes(1)
    expect(awardTimedExerciseReward).toHaveBeenCalledWith(defaultProps.initialExerciseId, 50)
    expect(toast.success).not.toHaveBeenCalled()


    // Verify ResultCard for points still shows 0
    const pointsCardCallConfirmed = mockResultCard.mock.calls.find(
      (call) => call[0].variant === "points"
    )
    expect(pointsCardCallConfirmed).toBeDefined()
    expect(pointsCardCallConfirmed?.[0].value).toBe(0)

    // Simulate clicking the "Continue" button on the results screen
    const continueButton = screen.getByTestId("footer-check-button")
    expect(continueButton).toHaveAttribute("data-status", "completed")
    fireEvent.click(continueButton)
    expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledWith("/learn")
  })
})

describe("Quiz Component - Non-Timed Exercises (Existing Functionality)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useGemsModal as jest.Mock).mockReturnValue({ open: jest.fn() });
        (usePracticeModal as jest.Mock).mockReturnValue({ open: jest.fn() });
        (useQuizAudio as jest.Mock).mockReturnValue({
            playCorrect: jest.fn(),
            playIncorrect: jest.fn(),
            playFinish: jest.fn(),
        });
        (awardTimedExerciseReward as jest.Mock).mockResolvedValue({ success: true, pointsAwarded: 0 });
        (upsertChallengeProgress as jest.Mock).mockResolvedValue({}); 
        (reduceGems as jest.Mock).mockResolvedValue({});
        mockRouterPush.mockClear();
        mockRouterRefresh.mockClear();
    });

    test("Non-Timed Mode: Correct answer calls upsertChallengeProgress and updates UI", async () => {
        render(<Quiz {...defaultProps} initialIsTimed={false} initialGems={5} initialPercentage={0} />);
        
        const header = screen.getByTestId("exercise-header");
        expect(header).toHaveTextContent("Gems: 5");
        expect(header).toHaveTextContent("Percentage: 0");

        const correctOptionButton = screen.getByTestId("option-10");
        fireEvent.click(correctOptionButton);
        
        const checkButton = screen.getByTestId("footer-check-button");
        await act(async () => {
            fireEvent.click(checkButton);
        });

        expect(upsertChallengeProgress).toHaveBeenCalledWith(defaultChallenge.id);
        expect(header).toHaveTextContent("Percentage: 100"); // 1 challenge, 100%
        // Gems might change based on isPractice or initialPercentage, default is not practice & 0%
        // For this default case, upsertChallengeProgress is called, but gems are not changed locally by it directly
        // unless specific conditions are met (isPractice or initialPercentage === 100)
        // The mock for upsertChallengeProgress doesn't simulate gem changes back to Quiz.
        // If gems were to change: expect(header).toHaveTextContent("Gems: NEW_VALUE");
    });

    test("Non-Timed Mode: Wrong answer calls reduceGems (if applicable)", async () => {
        // To test reduceGems, userSubscription must be null (default) and not isPractice (default)
        render(<Quiz {...defaultProps} initialIsTimed={false} initialGems={5} />);
        const header = screen.getByTestId("exercise-header");
        expect(header).toHaveTextContent("Gems: 5");

        const wrongOptionButton = screen.getByTestId("option-11");
        fireEvent.click(wrongOptionButton);
        
        const checkButton = screen.getByTestId("footer-check-button");
        await act(async () => {
            fireEvent.click(checkButton);
        });
        
        expect(reduceGems).toHaveBeenCalledWith(defaultChallenge.id);
        // Local gems state updates immediately
        expect(header).toHaveTextContent("Gems: 4"); 
    });

    test("Non-Timed Mode: awardTimedExerciseReward NOT called, router.refresh called on completion", async () => {
        render(<Quiz {...defaultProps} initialIsTimed={false} />);
        
        const correctOptionButton = screen.getByTestId("option-10");
        fireEvent.click(correctOptionButton);
        const checkButton = screen.getByTestId("footer-check-button");
        
        await act(async () => { fireEvent.click(checkButton) }); // Status "correct"
        await act(async () => { fireEvent.click(checkButton) }); // Click "Next" to complete

        expect(awardTimedExerciseReward).not.toHaveBeenCalled();

        // Simulate clicking the "Continue" button on the results screen
        const continueButtonOnResult = screen.getByTestId("footer-check-button")
        // Footer status should be "completed" when exercise is done
        expect(continueButtonOnResult).toHaveAttribute("data-status", "completed"); 
        fireEvent.click(continueButtonOnResult);
        
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1);
        expect(mockRouterPush).toHaveBeenCalledWith("/learn");
    });
});
