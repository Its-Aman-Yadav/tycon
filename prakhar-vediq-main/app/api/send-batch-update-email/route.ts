import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { to, batchName, courseName } = await req.json()

    if (!to || !batchName) {
      return Response.json(
        { success: false, error: "Missing required fields: 'to' or 'batchName'" },
        { status: 400 }
      )
    }

    // --- Nodemailer transporter ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const updatedOn = new Date().toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // --- Template message ---
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #000; max-width: 600px; padding: 20px;">
        <h3 style="margin-top: 0;">Program Module Updated – Action Required</h3>
        
        <p>Hello,</p>
        
        <p>This is to inform you that the Program module for your assigned batch has been <strong>updated</strong> on the Knowhive platform.</p>
        
        <p>Please log in to your dashboard to review the latest content, learning objectives, and any changes to the Program structure.</p>
        
        <p style="margin-top: 15px;">Check your Schedule Today: <a href="https://knowhive.vercel.app/dashboard">https://knowhive.vercel.app/</a></p>
        
        <h4 style="margin-bottom: 5px;">📌 Details:</h4>
        <p style="margin: 5px 0;">Program: <span style="font-weight: bold;">${courseName || "N/A"}</span></p>
        <p style="margin: 5px 0;">Batch: <span style="font-weight: bold;">${batchName}</span></p>
        <p style="margin: 5px 0;">Updated On: <span style="font-weight: bold;">${updatedOn}</span></p>
        
        <p style="margin-top: 20px;">
          Regards<br />
          Team Knowhive
        </p>
      </div>
    `

    const recipients = Array.isArray(to) ? to.join(",") : to

    const info = await transporter.sendMail({
      from: `"Knowhive Notifications" <${process.env.SMTP_USER}>`,
      to: recipients,
      subject: `Program Module Updated – Action Required`,
      html: htmlMessage,
    })

    console.log("✅ Batch update email sent:", info.messageId)

    return Response.json({
      success: true,
      message: "Batch update email sent successfully.",
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error("❌ Email send error:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
