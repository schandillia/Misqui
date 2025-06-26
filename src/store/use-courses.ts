import { create } from "zustand"

// Define Course type to match schema
type Course = {
  id: number
  title: string
  description: string
  image: string
  badge: string
  createdAt: Date
  updatedAt: Date
}

type CourseState = {
  courses: Course[]
  editingCourse: Course | undefined
  setCourses: (courses: Course[]) => void
  addCourse: (course: Course) => void
  updateCourse: (updatedCourse: Course) => void
  removeCourse: (courseId: number) => void
  setEditingCourse: (course: Course | undefined) => void
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  editingCourse: undefined,
  setCourses: (courses) => set({ courses }),
  addCourse: (course) =>
    set((state) => ({ courses: [course, ...state.courses] })),
  updateCourse: (updatedCourse) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      ),
    })),
  removeCourse: (courseId) =>
    set((state) => ({
      courses: state.courses.filter((course) => course.id !== courseId),
    })),
  setEditingCourse: (course) => set({ editingCourse: course }),
}))
