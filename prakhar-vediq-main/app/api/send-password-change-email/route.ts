import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, name } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = "Your Knowhive Password Has Been Changed";

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color:#b91c1c;">Hi ${name},</h2>
        <p>We wanted to let you know that your password for Knowhive was recently changed.</p>
        <p>This change was made on ${new Date().toLocaleString()}.</p>
        <p>Stay safe,<br/>— The Knowhive Security Team</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Knowhive Security" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Password change email sent:", info.response);
    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Email error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
