// Mock user types and data
export type UserRole = "student" | "teacher" | "admin"

export interface UserData {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
  updatedAt: string
  photoURL?: string | null
  bio?: string
  isEmailVerified?: boolean
}

// Mock users database
const mockUsers: Record<string, UserData> = {
  "student-1": {
    uid: "student-1",
    email: "student@example.com",
    displayName: "Student User",
    role: "student",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    photoURL: null,
    bio: "I am a student",
    isEmailVerified: true,
  },
  "teacher-1": {
    uid: "teacher-1",
    email: "teacher@example.com",
    displayName: "Teacher User",
    role: "teacher",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    photoURL: null,
    bio: "I am a teacher",
    isEmailVerified: true,
  },
  "admin-1": {
    uid: "admin-1",
    email: "admin@example.com",
    displayName: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    photoURL: null,
    bio: "I am an admin",
    isEmailVerified: true,
  },
}

// Mock courses database
export const mockCourses = [
  {
    id: "course-1",
    title: "Introduction to Web Development",
    description: "Learn the basics of HTML, CSS, and JavaScript",
    teacherId: "teacher-1",
    teacherName: "Teacher User",
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailUrl: null,
    modules: [
      {
        title: "HTML Basics",
        description: "Learn the fundamentals of HTML",
        lessons: [
          { title: "Introduction to HTML", content: "HTML is a markup language..." },
          { title: "HTML Elements", content: "HTML elements are the building blocks..." },
        ],
      },
      {
        title: "CSS Basics",
        description: "Learn the fundamentals of CSS",
        lessons: [
          { title: "Introduction to CSS", content: "CSS is a styling language..." },
          { title: "CSS Selectors", content: "CSS selectors are used to target HTML elements..." },
        ],
      },
    ],
  },
  {
    id: "course-2",
    title: "Advanced React Patterns",
    description: "Master advanced React concepts and patterns",
    teacherId: "teacher-1",
    teacherName: "Teacher User",
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailUrl: null,
    modules: [],
  },
]

// Mock sessions database
export const mockSessions = [
  {
    id: "session-1",
    title: "Web Development Q&A",
    description: "Live Q&A session for the Web Development course",
    teacherId: "teacher-1",
    teacherName: "Teacher User",
    courseId: "course-1",
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1 hour
    zoomLink: "https://zoom.us/j/123456789",
  },
  {
    id: "session-2",
    title: "React Hooks Deep Dive",
    description: "Exploring React Hooks in detail",
    teacherId: "teacher-1",
    teacherName: "Teacher User",
    courseId: "course-2",
    startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    endTime: new Date(Date.now() + 172800000 + 3600000).toISOString(), // Day after tomorrow + 1 hour
    zoomLink: "https://zoom.us/j/987654321",
  },
]

// Mock enrollments
export const mockEnrollments = [
  {
    id: "enrollment-1",
    studentId: "student-1",
    courseId: "course-1",
    enrolledAt: new Date().toISOString(),
  },
]

// Mock authentication functions
export async function mockRegisterUser(
  email: string,
  password: string,
  name: string,
  role: UserRole,
): Promise<UserData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Create a new user
  const uid = `user-${Object.keys(mockUsers).length + 1}`
  const newUser: UserData = {
    uid,
    email,
    displayName: name,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    photoURL: null,
    isEmailVerified: true,
  }

  // Add to mock database
  mockUsers[uid] = newUser

  return newUser
}

export async function mockLoginUser(email: string, password: string): Promise<UserData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Find user by email
  const user = Object.values(mockUsers).find((u) => u.email === email)

  if (!user) {
    throw new Error("User not found")
  }

  return user
}

export async function mockGetUserData(uid: string): Promise<UserData | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  return mockUsers[uid] || null
}

export async function mockUpdateUserData(uid: string, data: Partial<UserData>): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (!mockUsers[uid]) {
    throw new Error("User not found")
  }

  mockUsers[uid] = {
    ...mockUsers[uid],
    ...data,
    updatedAt: new Date().toISOString(),
  }
}

export async function mockSignOut(): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Nothing to do here in the mock version
  return
}

// Mock data access functions
export async function getMockCourse(courseId: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockCourses.find((course) => course.id === courseId) || null
}

export async function getMockCourses() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockCourses
}

export async function getMockSessions() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return mockSessions
}

export async function getMockUserCourses(userId: string, role: UserRole) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (role === "teacher") {
    return mockCourses.filter((course) => course.teacherId === userId)
  } else {
    // For students, return enrolled courses
    const enrollments = mockEnrollments.filter((e) => e.studentId === userId)
    return mockCourses.filter((course) => enrollments.some((e) => e.courseId === course.id))
  }
}
