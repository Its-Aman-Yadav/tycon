"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Course {
    id: string;
    title: string;
    description?: string;
    duration?: number;
    type?: string;
    category?: string;
    thumbnailUrl?: string;
    visibility?: string;
}

export default function CourseDetailsPage() {
    const router = useRouter();

    const { id } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const docRef = doc(db, "courses", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
                } else {
                    console.error("Course not found");
                }
            } catch (err) {
                console.error("Error fetching course:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex justify-center items-center text-muted-foreground">
                Course not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                    src={course.thumbnailUrl || "/default-course.jpg"}
                    alt={course.title}
                    className="w-full h-64 object-cover"
                />

                <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {course.title}
                    </h1>
                    <p className="text-gray-600 mb-4">{course.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        {course.duration && (
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{course.duration} weeks</span>
                            </div>
                        )}
                        {course.type && (
                            <span className="capitalize">Type: {course.type}</span>
                        )}
                        {course.category && (
                            <span className="capitalize">Category: {course.category}</span>
                        )}
                    </div>

                    {/* ✅ Updated Button */}
                    <Button
                        onClick={() => router.push("/auth/login/student")}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-8 py-2"
                    >
                        Enroll Now
                    </Button>

                    <div className="mt-8">
                        <Link
                            href="/"
                            className="text-green-600 text-sm hover:underline"
                        >
                            ← Back to Courses
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
