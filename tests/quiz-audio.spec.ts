import { test, expect } from "@playwright/test"
import { useQuizAudio } from "@/store/use-quiz-audio"

// Skip tests if running in CI environment
test.describe("Quiz Audio Store", () => {
  test.beforeEach(async ({ page }) => {
    // Mock window.Audio for testing
    await page.addInitScript(() => {
      window.Audio = class MockAudio {
        currentTime = 0
        play() {
          return Promise.resolve()
        }
      } as any
    })
  })

  test("should have audio playback functions", async ({ page }) => {
    await page.goto("/")
    const store = useQuizAudio.getState()
    
    expect(store.playFinish).toBeDefined()
    expect(store.playCorrect).toBeDefined()
    expect(store.playIncorrect).toBeDefined()
  })

  test("should handle finish audio playback", async ({ page }) => {
    await page.goto("/")
    const store = useQuizAudio.getState()
    
    // Verify the function exists and is callable
    expect(() => store.playFinish()).not.toThrow()
  })

  test("should handle correct audio playback", async ({ page }) => {
    await page.goto("/")
    const store = useQuizAudio.getState()
    
    expect(() => store.playCorrect()).not.toThrow()
  })

  test("should handle incorrect audio playback", async ({ page }) => {
    await page.goto("/")
    const store = useQuizAudio.getState()
    
    expect(() => store.playIncorrect()).not.toThrow()
  })
}) 