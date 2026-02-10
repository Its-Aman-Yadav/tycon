export interface Student {
  id: string
  name: string
  email: string
  grade: string
}

export interface Course {
  id: string
  name: string
  title?: string
  description?: string
  schedule?: string
  room?: string
  duration?: string
  level?: string
  isPublished?: boolean
  thumbnail?: string
  teacherId?: string
  teacherName?: string
  createdAt?: string
  updatedAt?: string
  students: Student[]
}

export interface Teacher {
  id: string
  uid?: string
  name: string
  department: string
  email: string
  phone: string
  avatar?: string
  role?: string
  createdAt?: string
  courses: Course[]
}
