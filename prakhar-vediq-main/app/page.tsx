"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getDocs, getDoc } from "firebase/firestore"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { query, orderBy, limit } from "firebase/firestore";
import { ChevronLeft } from "lucide-react";
import { useRef } from "react";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Clock,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";



interface Course {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  category?: string;
  aiModeEnabled?: boolean;
  thumbnailUrl?: string; // ✅ add this
  teacherId?: string;
  level?: string;
  isFree?: boolean;
  price?: number;
}

interface TeacherProfile {
  fullName: string
  profilePictureURL: string
  educationalQualification: string
  qualification?: string
  industryCertification?: string
  industryExpertise?: string
  professionalExperience?: string
}




export default function Home() {

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [allTeachers, setAllTeachers] = useState<TeacherProfile[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teachers"), (snapshot) => {
      const teachers = snapshot.docs.map((doc) => doc.data() as TeacherProfile)
      setAllTeachers(teachers)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (dialogOpen && allTeachers.length > 0) {
      const random = Math.floor(Math.random() * allTeachers.length);
      setTeacherProfile(allTeachers[random]);
    }
  }, [dialogOpen, allTeachers]);



  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseQuery = query(
          collection(db, "courses"),
          orderBy("createdAt", "asc"),
          limit(5)
        );
        const querySnapshot = await getDocs(courseQuery);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);


  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320; // card width + margin
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (

    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-none">Knowhive</span>
              <span className="text-xs text-muted-foreground leading-none">
                Platform
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-sm font-medium hover:text-green-600 transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/"
              className="text-sm font-medium hover:text-green-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium hover:text-green-600 transition-colors"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" className="hidden sm:flex">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden mt-5 pt-0 pb-20 md:pt-0 md:pb-32 lg:pt-0 lg:pb-40">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50"></div>
          <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-5"></div>
          <div className="container relative px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 w-fit">
                  <span>Transform your learning journey</span>
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
                    Elevate Your Knowledge with Knowhive
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                    Discover a new way of learning with our cutting-edge
                    platform designed to help you master new skills at your own
                    pace.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white w-full sm:w-auto"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Explore Courses
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 opacity-30 blur-xl"></div>
                  <img
                    src="/hero.jpg"
                    alt="Online Learning"
                    className="relative rounded-xl shadow-lg w-full max-w-[550px] aspect-square object-cover"
                  />
                  <div className="absolute -bottom-6 -left-6 rounded-lg bg-background p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">1000+ Courses</p>
                        <p className="text-xs text-muted-foreground">
                          For all skill levels
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-6 -right-6 rounded-lg bg-background p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                        <Award className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="w-full py-16 md:py-24 overflow-hidden bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Featured Courses</h2>
                <p className="text-muted-foreground mt-2">
                  Explore our most popular learning paths
                </p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => scroll("left")}
                  className="p-2 rounded-full border hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="p-2 rounded-full border hover:bg-gray-100 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground">Loading courses...</p>
            ) : courses.length === 0 ? (
              <p className="text-center text-muted-foreground">No courses found.</p>
            ) : (
              <div className="overflow-x-auto scrollbar-hide">
                <div
                  ref={scrollContainerRef}
                  className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
                >


                  {courses.map((course, index) => (
                    <div
                      key={course.id}
                      className="min-w-[300px] max-w-[300px] bg-white border rounded-xl shadow-sm transition hover:shadow-md"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={
                            course.thumbnailUrl ||
                            `default.jpg`
                          }
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://source.unsplash.com/400x250/?education";
                          }}
                          alt={course.title || "Course thumbnail"}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg truncate">
                            {course.title || "Untitled Course"}
                          </h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm font-medium">4.9</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {course.description || "No description available."}
                        </p>
                        <div className="flex justify-between text-xs text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {course.duration
                              ? `${course.duration} weeks`
                              : "Not specified"}
                          </div>
                          <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                            {course.category || "General"}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-green-600 hover:text-white transition-colors"
                          onClick={() => {
                            setSelectedCourse(course);
                            setDialogOpen(true);
                          }}
                        >
                          View Course
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>


        {/* Student Reviews Section */}
        <section className="w-full py-20 bg-gray-50 overflow-hidden">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-10">
              What Our Students Say
            </h2>

            <div className="relative w-full overflow-hidden">
              <div className="scroll-reviews gap-6">
                {[
                  {
                    name: "Rohan Sharma",
                    role: "Engineering Student",
                    text: "Bhai, mazaa aa gaya! The concepts are explained so simply. Not like those boring lectures. Highly recommended!",
                    image: "/testimonials/rohan.png"
                  },
                  {
                    name: "Priya Patel",
                    role: "Job Aspirant",
                    text: "Honestly speaking, I was struggling with coding. But Knowhive made it so easy. The Hindi explanation helps a lot!",
                    image: "/testimonials/priya.png"
                  },
                  {
                    name: "Amit Kumar",
                    role: "Software Developer",
                    text: "Content is top notch. Better than many expensive courses. Found it very useful for my job switch.",
                    image: "/testimonials/amit.png"
                  },
                  {
                    name: "Sneha Gupta",
                    role: "Design Student",
                    text: "Just love the way they teach. It feels like a friend is explaining. Doubts bhi clear ho jate hain instantly.",
                    image: "/testimonials/sneha.png"
                  },
                  {
                    name: "Vikram Singh",
                    role: "Freelancer",
                    text: "Best investment for my career. The projects are real-world based. Thumbs up from my side! Great work team.",
                    image: "/testimonials/amit.png"
                  },
                  {
                    name: "Anjali Verma",
                    role: "Student",
                    text: "Simple, easy and effective. Exams ke liye bahut helpful raha. Thank you Knowhive team for this amazing platform.",
                    image: "/testimonials/priya.png"
                  },
                  {
                    name: "Rahul Verma",
                    role: "Web Developer",
                    text: "I learned React from here and got my first job. The roadmap is very clear. Thank you so much!",
                    image: "/testimonials/rohan.png"
                  }
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    className="min-w-[300px] max-w-[300px] mx-3 bg-white p-5 rounded-xl shadow-md flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-semibold">{testimonial.name}</h4>
                        <p className="text-xs text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                      “{testimonial.text}”
                    </p>

                    <div className="flex gap-1 mt-auto">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* Stats Section */}

        {/* CTA Section */}
        <section className="relative w-full py-20 md:py-28 overflow-hidden">
          {/* Background with pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700"></div>
          <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

          <div className="container relative px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-1 rounded-full w-fit mx-auto mb-6">
                <div className="bg-white/20 rounded-full px-4 py-1">
                  <span className="text-xs font-medium text-white">
                    Join 5,000+ students
                  </span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white text-center">
                Ready to{" "}
                <span className="relative inline-block">
                  Transform
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-white/40 rounded-full"></span>
                </span>{" "}
                Your Learning Journey?
              </h2>

              <p className="max-w-2xl mx-auto mb-10 text-white/90 text-center text-lg">
                Join thousands of students already learning on Knowhive and take
                your skills to the next level with expert-led courses and a
                supportive community.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-white text-green-600 hover:bg-green-50 hover:text-green-700 font-medium px-8 shadow-lg shadow-green-900/20"
                  >
                    Sign Up Now
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-green-600 hover:bg-green-50 hover:text-green-700 font-medium px-8 shadow-lg shadow-green-900/20"
                  >
                    Browse Courses
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
                {[
                  { label: "Courses", value: "1,000+", icon: BookOpen },
                  { label: "Students", value: "5,000+", icon: Users },
                  { label: "Instructors", value: "100+", icon: Award },
                  { label: "Completion Rate", value: "94%", icon: Clock },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4"
                  >
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-white/80 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Left - Course Image */}
              <div className="h-60 md:h-auto w-full">
                <img
                  src={selectedCourse?.thumbnailUrl || `default.jpg`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://source.unsplash.com/400x250/?education";
                  }}
                  alt="Course Thumbnail"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Right - Course Info */}
              <div className="p-6 relative">
                {/* Faculty box */}




                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold">{selectedCourse?.title}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {selectedCourse?.description || "No description available."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 text-sm text-muted-foreground mt-4">
                  <p>
                    <span className="font-semibold text-foreground">Category:</span>{" "}
                    {selectedCourse?.category || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Duration:</span>{" "}
                    {selectedCourse?.duration ? `${selectedCourse.duration} weeks` : "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Level:</span>{" "}
                    {selectedCourse?.level || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Price:</span>{" "}
                    {selectedCourse?.isFree || selectedCourse?.price === 0
                      ? "Free"
                      : `₹${selectedCourse?.price}`}
                  </p>
                </div>
                {teacherProfile && (
                  <div className="mt-6 border rounded-lg p-3 bg-white shadow-md w-full md:w-3/4">
                    <h4 className="text-sm font-semibold mb-2">Faculty</h4>
                    <img
                      src={
                        teacherProfile.profilePictureURL?.trim()
                          ? teacherProfile.profilePictureURL
                          : "/d.png" // fallback image
                      }
                      alt="Teacher"
                      className="w-10 h-10 rounded-full object-cover mb-2"
                    />
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <p>
                        <span className="font-semibold">Name:</span> {teacherProfile.fullName}
                      </p>
                      <p>
                        <span className="font-semibold">Qualification:</span>{" "}
                        {teacherProfile.educationalQualification}
                      </p>
                      <p>
                        <span className="font-semibold">Experience:</span>{" "}
                        {teacherProfile.professionalExperience}
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-6">
                  <Link href="/auth/login/student">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700">
                      Start Learning
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>



      </main>

      <footer className="border-t py-12 md:py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <span className="text-white font-bold text-xl">E</span>
                <div className="flex flex-col">
                  <span className="font-bold text-xl leading-none">
                    <span className="text-orange-500">Know</span>
                    <span className="text-green-600">hive</span>
                  </span>
                  <span className="text-xs text-muted-foreground leading-none">
                    Platform
                  </span>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Knowhive is a modern learning platform designed to help you master
                new skills and advance your career.
              </p>
              {/* <div className="flex space-x-4">
                {["twitter", "facebook", "instagram", "linkedin"].map((social) => (
                  <Link
                    key={social}
                    href={`https://${social}.com`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <img
                        src={`/abstract-geometric-shapes.png?height=16&width=16&query=${social}%20icon`}
                        alt={`${social} icon`}
                        className="h-4 w-4"
                      />
                    </div>
                  </Link>
                ))}
              </div> */}
            </div>
            {/* Removed About, Courses, and Support sections */}
          </div>
          <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Knowhive. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
