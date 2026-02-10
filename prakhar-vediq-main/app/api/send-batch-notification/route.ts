import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { recipients, batchName, courseName, startDate, endDate, sessions } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Helper to format schedule
    const formatSchedule = (sessions: any[]) => {
      if (!sessions || sessions.length === 0) return { days: "N/A", uniqueTimings: "N/A" };
      // Assuming sessions have 'day', 'startTime', 'endTime'
      const days = sessions.map((s: any) => s.day.charAt(0).toUpperCase() + s.day.slice(1)).join(", ");
      const timings = sessions.map((s: any) => `${s.startTime} - ${s.endTime} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`).join(", "); // Minimal formatting
      // Better: Group by time if possible, or just list unique ones.
      // For simplicity, just listing first session's timing if recurring, or combining.
      // Let's try to follow the template example: "Monday, Wednesday, Friday" and "6:00 PM - 8:00 PM IST"
      // We will just use the first session's timing as a representative or list all if different
      const uniqueTimings = Array.from(new Set(sessions.map((s: any) => `${s.startTime} - ${s.endTime}`))).join(", ");

      return { days, uniqueTimings };
    };

    const { days, uniqueTimings } = formatSchedule(sessions);

    const subject = "Subject: Batch Assigned – Your New Training Schedule";

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#000; max-width: 600px; padding: 20px;">
        <h3 style="margin-top: 0;">Batch Assigned – Your New Schedule</h3>
        <p>Hello,</p>
        
        <p>We are pleased to inform you that a new batch has been <strong>successfully created</strong> on the Knowhive platform.</p>
        
        <p>You can now access all relevant details—including the schedule and course materials—directly from your dashboard.</p>
        
        <h4 style="margin-bottom: 5px;">📌 Batch Details:</h4>
        <p style="margin: 5px 0;">Batch Name: <span>${batchName}</span></p>
        <p style="margin: 5px 0;">Start Date: <span>${startDate || "N/A"}</span></p>
        <p style="margin: 5px 0;">Class Schedule: <span>${days}</span></p>
        <p style="margin: 5px 0;">Class Timing: <span>${uniqueTimings}</span></p>
        
        <p style="margin-top: 15px;">Check your Schedule Today: <a href="https://knowhive.vercel.app/dashboard">https://knowhive.vercel.app/</a></p>
        
        <p>If you need any support in accessing materials or understanding the schedule, feel free to reach out.</p>
        
        <p>We appreciate your commitment and look forward to an impactful learning journey!</p>
        
        <p>
          Regards<br />
          Team Knowhive
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Knowhive LMS" <${process.env.SMTP_USER}>`,
      to: recipients.join(", "),
      subject,
      html,
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Notification error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
