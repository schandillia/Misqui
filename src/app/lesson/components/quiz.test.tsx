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

// --- Mocks ---
jest.mock("@/app/actions/challenge-progress")
jest.mock("@/app/actions/user-progress")
jest.mock("@/app/actions/timed-exercise")
jest.mock("@/store/use-gems-modal")
jest.mock("@/store/use-practice-modal")
jest.mock("@/store/use-quiz-audio")
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
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
jest.mock("@/app/lesson/components/result-card", () => ({
  ResultCard: jest.fn(() => <div data-testid="result-card" />),
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
    ;(awardTimedExerciseReward as jest.Mock).mockResolvedValue({ success: true });
    ;(upsertChallengeProgress as jest.Mock).mockResolvedValue({});
    ;(reduceGems as jest.Mock).mockResolvedValue({});

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
    expect(upsertChallengeProgress).not.toHaveBeenCalled() // Should not be called in timed mode from Quiz
    expect(reduceGems).not.toHaveBeenCalled()
  })

  test("Timed Mode: awardTimedExerciseReward action called on completion with 100% score", async () => {
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
    // initialExerciseId, scorePercentage (100 / 1 challenge = 100%)
    expect(awardTimedExerciseReward).toHaveBeenCalledWith(defaultProps.initialExerciseId, 100)
  })

   test("Timed Mode: awardTimedExerciseReward action called on completion with <100% score", async () => {
    const challenges = [
      { ...defaultChallenge, id: 1, order: 1 },
      { ...defaultChallenge, id: 2, question:"Q2", order: 2, challengeOptions: [
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
    // initialExerciseId, scorePercentage (1 correct / 2 total = 50%)
    expect(awardTimedExerciseReward).toHaveBeenCalledWith(defaultProps.initialExerciseId, 50)
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
        (awardTimedExerciseReward as jest.Mock).mockResolvedValue({ success: true });
        (upsertChallengeProgress as jest.Mock).mockResolvedValue({}); // Default success
        (reduceGems as jest.Mock).mockResolvedValue({}); // Default success
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

    test("Non-Timed Mode: awardTimedExerciseReward NOT called on completion", async () => {
        render(<Quiz {...defaultProps} initialIsTimed={false} />);
        
        const correctOptionButton = screen.getByTestId("option-10");
        fireEvent.click(correctOptionButton);
        const checkButton = screen.getByTestId("footer-check-button");
        
        await act(async () => { fireEvent.click(checkButton) }); // Status "correct"
        await act(async () => { fireEvent.click(checkButton) }); // Click "Next"

        expect(awardTimedExerciseReward).not.toHaveBeenCalled();
    });
});
