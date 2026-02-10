import { TeacherOnboardingForm } from "@/components/teachers/teacher-onboarding-form"

export default function OnboardTeacherPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Onboard New Trainer</h1>
          <p className="text-gray-500">Add a new teacher to the system and assign them to batches</p>
        </div>

        <TeacherOnboardingForm />
      </main>
    </div>
  )
}
