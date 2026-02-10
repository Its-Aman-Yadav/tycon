import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export type UserRole = "student" | "teacher" | "admin"

export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
  photoURL?: string | null
  bio?: string
  isEmailVerified?: boolean
}

// Function to check if Firebase is properly initialized
export function checkFirebaseInitialization() {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized")
  }

  if (!db) {
    throw new Error("Firestore is not initialized")
  }

  return true
}

export async function registerUser(email: string, password: string, name: string, role: UserRole): Promise<User> {
  try {
    // Check Firebase initialization
    checkFirebaseInitialization()

    console.log("Starting user registration process...")

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log("User created successfully, updating profile...")

    // Update profile with display name
    await updateProfile(user, {
      displayName: name,
    })

    console.log("Profile updated, sending email verification...")

    // Send email verification
    await sendEmailVerification(user)

    console.log("Email verification sent, creating user document...")

    // Create user document in Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoURL: user.photoURL,
      isEmailVerified: user.emailVerified,
    }

    await setDoc(doc(db, "users", user.uid), userData)

    console.log("User registration completed successfully")
    return user
  } catch (error: any) {
    console.error("Error in registerUser:", error)

    // Add more specific error handling
    if (error.code === "auth/configuration-not-found") {
      console.error("Firebase configuration not found. Check your environment variables and Firebase setup.")
    }

    throw error
  }
}

export async function loginUser(email: string, password: string): Promise<User> {
  try {
    checkFirebaseInitialization()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error in loginUser:", error)
    throw error
  }
}

export async function signOut(): Promise<void> {
  try {
    checkFirebaseInitialization()
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Error in signOut:", error)
    throw error
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    checkFirebaseInitialization()
    await firebaseSendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Error in resetPassword:", error)
    throw error
  }
}

export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    checkFirebaseInitialization()
    const userDocRef = doc(db, "users", uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    return null
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

export async function updateUserData(uid: string, data: Partial<UserData>): Promise<void> {
  try {
    checkFirebaseInitialization()
    const userDocRef = doc(db, "users", uid)
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error updating user data:", error)
    throw error
  }
}
