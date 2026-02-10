"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Archive,
  Edit,
  MoreHorizontal,
  Users,
  Loader2,
  Search,
  Filter,
  Pencil,
  X,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  documentId,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface Teacher {
  id: string;
  name: string;
  fullName?: string;
  profilePictureURL?: string;
  subjects?: string[];
}

interface Batch {
  id: string;
  name: string;
  course: {
    id: string;
    title: string;
  };
  teachers: Teacher[];
  startDate: string;
  endDate: string;
  mode: "live" | "recorded" | "both";
  schedule?: string;
  studentsCount: number;
  status: "active" | "upcoming" | "completed";
}

export function BatchesList() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchBatchesAndTeachers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch all batches
        const batchesQuery = query(
          collection(db, "batches"),
          orderBy("createdAt", "desc")
        );
        const batchesSnapshot = await getDocs(batchesQuery);

        // Prepare initial batch data without complete teacher info
        const initialBatches: Batch[] = [];
        const allTeacherIds: string[] = [];

        batchesSnapshot.forEach((doc) => {
          const batchData = doc.data();

          // Collect all teacher IDs for later fetching
          if (batchData.teacherIds && Array.isArray(batchData.teacherIds)) {
            allTeacherIds.push(...batchData.teacherIds);
          }

          // Determine batch status based on dates
          const today = new Date();
          const startDate = new Date(batchData.startDate);
          const endDate = new Date(batchData.endDate);

          let status: "active" | "upcoming" | "completed" = "active";
          if (today < startDate) {
            status = "upcoming";
          } else if (today > endDate) {
            status = "completed";
          }

          // Format schedule from sessions if available
          let schedule = "Not specified";
          if (batchData.sessions && batchData.sessions.length > 0) {
            const days = [...new Set(batchData.sessions.map((s: any) => s.day))]
              .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
              .join(", ");

            const firstSession = batchData.sessions[0];
            schedule = `${days} ${firstSession.startTime} - ${firstSession.endTime}`;

            if (batchData.sessions.length > 1) {
              schedule += ` (${batchData.sessions.length} sessions)`;
            }
          }

          // Create initial teachers array with just IDs
          // We'll replace with full teacher data later
          const initialTeachers: Teacher[] = [];
          if (batchData.teacherIds) {
            for (let i = 0; i < batchData.teacherIds.length; i++) {
              initialTeachers.push({
                id: batchData.teacherIds[i],
                name: "Loading...", // Placeholder until we fetch from teachers table
              });
            }
          }

          // Add batch to initial array
          initialBatches.push({
            id: doc.id,
            name: batchData.name || "Unnamed Batch",
            course: {
              id: batchData.course || "",
              title: batchData.course || "Unknown Course",
            },
            teachers: initialTeachers,
            startDate: batchData.startDate || "",
            endDate: batchData.endDate || "",
            mode: batchData.mode || "live",
            schedule,
            studentsCount: batchData.studentIds
              ? batchData.studentIds.length
              : 0,
            status: batchData.status || status,
          });
        });

        // Step 2: Get unique teacher IDs
        const uniqueTeacherIds = [...new Set(allTeacherIds)];

        // Step 3: Fetch teacher data if we have any teacher IDs
        if (uniqueTeacherIds.length > 0) {
          // Firebase has a limit of 10 items in 'in' queries, so we need to batch our requests
          const teachersMap: Record<string, Teacher> = {};

          // Process teacher IDs in chunks of 10
          for (let i = 0; i < uniqueTeacherIds.length; i += 10) {
            const chunk = uniqueTeacherIds.slice(i, i + 10);

            const teachersQuery = query(
              collection(db, "teachers"),
              where(documentId(), "in", chunk)
            );

            const teachersSnapshot = await getDocs(teachersQuery);

            teachersSnapshot.forEach((doc) => {
              const teacherData = doc.data();
              teachersMap[doc.id] = {
                id: doc.id,
                // Use fullName from teachers table as primary name
                name:
                  teacherData.fullName || teacherData.name || "Unknown Teacher",
                fullName: teacherData.fullName,
                profilePictureURL: teacherData.profilePictureURL || null,
                subjects: teacherData.subjects || [],
              };
            });
          }

          // Step 4: Update batches with complete teacher info
          const completeBatches = initialBatches.map((batch) => {
            const updatedTeachers = batch.teachers.map((teacher) => {
              // If we have additional data for this teacher, use it
              if (teachersMap[teacher.id]) {
                return teachersMap[teacher.id];
              }
              return {
                ...teacher,
                name: "Unknown Teacher", // Fallback if teacher not found
              };
            });

            return {
              ...batch,
              teachers: updatedTeachers,
            };
          });

          setBatches(completeBatches);
          setFilteredBatches(completeBatches);
        } else {
          // If no teachers, just use the initial batches
          setBatches(initialBatches);
          setFilteredBatches(initialBatches);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load batches. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBatchesAndTeachers();
  }, []);

  // Apply filters whenever search or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, modeFilter, batches]);

  const applyFilters = () => {
    let result = [...batches];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (batch) =>
          batch.name.toLowerCase().includes(query) ||
          batch.course.title.toLowerCase().includes(query) ||
          batch.teachers.some((teacher) =>
            teacher.name.toLowerCase().includes(query)
          )
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((batch) => batch.status === statusFilter);
    }

    // Apply mode filter
    if (modeFilter !== "all") {
      result = result.filter((batch) => batch.mode === modeFilter);
    }

    setFilteredBatches(result);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setModeFilter("all");
    setFilteredBatches(batches);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const deleteHandler = async (batchId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this batch? This action cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(db, "batches", batchId));
        // Remove the batch from state after successful deletion
        const updatedBatches = batches.filter((batch) => batch.id !== batchId);
        setBatches(updatedBatches);
        setFilteredBatches(
          filteredBatches.filter((batch) => batch.id !== batchId)
        );
      } catch (err) {
        console.error("Error deleting batch:", err);
        alert("Failed to delete batch. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#006400]" />
          <p className="text-sm text-gray-500">Loading batches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-800">
        <p>{error}</p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
        <h3 className="mb-2 text-lg font-medium">No batches found</h3>
        <p className="mb-4 text-gray-500">
          Get started by creating your first batch
        </p>
        <Button asChild className="bg-[#006400] hover:bg-[#005000]">
          <Link href="/dashboard/admin/batches/create">Create Batch</Link>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div>
        <div className="mb-4 flex flex-col space-y-4">
          {/* Search and Filter Bar */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search batches by name, course, or teacher..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {(statusFilter !== "all" || modeFilter !== "all") && (
                <Badge className="ml-1 bg-[#006400]">
                  {statusFilter !== "all" && modeFilter !== "all" ? 2 : 1}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid gap-4 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="live">Live Classes</SelectItem>
                    <SelectItem value="recorded">Recorded</SelectItem>
                    <SelectItem value="both">Live & Recorded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetFilters}
                  disabled={
                    statusFilter === "all" &&
                    modeFilter === "all" &&
                    !searchQuery
                  }
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {filteredBatches.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
            <h3 className="mb-2 text-lg font-medium">No matching batches</h3>
            <p className="mb-4 text-gray-500">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <div className="font-medium">{batch.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(batch.startDate)} -{" "}
                        {formatDate(batch.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>{batch.course.title}</TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {batch.teachers.map((teacher) => (
                          <Tooltip key={teacher.id}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8 border-2 border-white cursor-pointer">
                                <AvatarImage
                                  src={
                                    teacher.profilePictureURL ||
                                    "/placeholder-user.jpg"
                                  }
                                  alt={teacher.name}
                                />
                                <AvatarFallback>
                                  {teacher.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm font-medium">
                                {teacher.name}
                              </div>
                              {teacher.subjects &&
                                teacher.subjects.length > 0 && (
                                  <div className="text-xs text-gray-500">
                                    {teacher.subjects.join(", ")}
                                  </div>
                                )}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{batch.schedule}</div>
                      <Badge
                        variant="outline"
                        className={
                          batch.mode === "live"
                            ? "bg-blue-50 text-blue-600"
                            : batch.mode === "recorded"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-indigo-50 text-indigo-600"
                        }
                      >
                        {batch.mode === "live"
                          ? "Live Classes"
                          : batch.mode === "recorded"
                            ? "Recorded"
                            : "Live & Recorded"}
                      </Badge>
                    </TableCell>
                    <TableCell>{batch.studentsCount} students</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          batch.status === "active"
                            ? "bg-green-50 text-green-600"
                            : batch.status === "upcoming"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                        }
                      >
                        {batch.status === "active"
                          ? "Active"
                          : batch.status === "upcoming"
                            ? "Upcoming"
                            : "Completed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/batches/${batch.id}`}>
                              <Users className="mr-2 h-4 w-4" /> View Roster
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/batches/${batch.id}/attendance`}>
                              <Users className="mr-2 h-4 w-4" /> View Attendance
                            </Link>
                          </DropdownMenuItem>


                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/admin/batches/${batch.id}/edit`}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => deleteHandler(batch.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Archive className="mr-2 h-4 w-4" /> Delete Batch
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
