"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function EngagementSnapshot() {
  const [activeTab, setActiveTab] = useState("video")

  const videoCompletionData = [
    { name: "Completed", value: 68, color: "#006400" },
    { name: "Partial", value: 22, color: "#90EE90" },
    { name: "Not Started", value: 10, color: "#E0E0E0" },
  ]

  const attendanceData = [
    { day: "Mon", value: 92 },
    { day: "Tue", value: 88 },
    { day: "Wed", value: 94 },
    { day: "Thu", value: 85 },
    { day: "Fri", value: 78 },
    { day: "Sat", value: 65 },
    { day: "Sun", value: 60 },
  ]

  const courseAccessData = [
    { hour: "12am", Physics: 5, Math: 8, Programming: 3 },
    { hour: "3am", Physics: 2, Math: 3, Programming: 1 },
    { hour: "6am", Physics: 10, Math: 15, Programming: 8 },
    { hour: "9am", Physics: 45, Math: 50, Programming: 35 },
    { hour: "12pm", Physics: 60, Math: 55, Programming: 40 },
    { hour: "3pm", Physics: 75, Math: 80, Programming: 65 },
    { hour: "6pm", Physics: 50, Math: 60, Programming: 45 },
    { hour: "9pm", Physics: 30, Math: 35, Programming: 25 },
  ]

  return (
    <div className="relative">
      {/* Coming Soon overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/70 backdrop-blur-[1px]">
        <Badge className="bg-[#006400] px-3 py-1.5 text-base font-medium">Coming Soon</Badge>
      </div>

      <Card className="opacity-60">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Engagement Snapshot</CardTitle>
            <CardDescription>Student activity and engagement metrics</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-[#006400]">
            View Reports <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b">
              {["video", "attendance", "access"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === tab
                      ? "border-b-2 border-[#006400] text-[#006400]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "video" && "Video Completion"}
                  {tab === "attendance" && "Attendance"}
                  {tab === "access" && "Course Access"}
                </button>
              ))}
            </div>

            {/* Charts */}
            <div className="h-[300px] w-full">
              {activeTab === "video" && (
                <div className="flex h-full items-center justify-center">
                  <div className="h-[280px] w-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={videoCompletionData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          label
                        >
                          {videoCompletionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-4 space-y-2">
                    {videoCompletionData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-sm text-gray-600">
                          {entry.name}: {entry.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "attendance" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#006400" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeTab === "access" && (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={courseAccessData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="Physics" stroke="#006400" strokeWidth={2} />
                      <Line type="monotone" dataKey="Math" stroke="#800080" strokeWidth={2} />
                      <Line type="monotone" dataKey="Programming" stroke="#008080" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="mt-3 flex justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#006400]"></div> Physics
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#800080]"></div> Math
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#008080]"></div> Programming
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
