import nodemailer from "nodemailer";
export async function POST(req: Request) {
  try {
    const { to, name, password } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // use STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = "Knowhive......REGISTRATION COMPLETED";

    const message = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #000; max-width: 600px; padding: 20px;">
        <p style="margin-top: 0;">Students Registration form.</p>
        <p><strong>Subject: <span style="text-decoration: underline; text-decoration-style: dotted;">Knowhive</span>......REGISTRATION COMPLETED</strong></p>
        
        <p>Dear ${name},</p>
        
        <p style="padding: 5px;">
          Welcome to <strong>Knowhive</strong>! We’re excited to have you 
          join our platform and begin your journey toward smarter, more flexible learning.
        </p>

        <p style="padding: 5px;">
          You can now access your <span style="text-decoration: underline; text-decoration-style: dotted;">personalized</span> online learning dashboard using the details below:
        </p>

        <p style="padding: 5px;">
          <strong>Login URL:</strong> <a href="https://knowhive.vercel.app/auth/login/student">https://knowhive.vercel.app/auth/login/student</a>
        </p>

        <p style="padding: 5px;">
          <strong>Username:</strong> "${to}"
        </p>

        <p style="padding: 5px;">
          <strong>Default Password:</strong> ${password}
        </p>

        <p style="padding: 5px;">
          If you have any trouble logging in or need assistance, feel free to reply to this email or contact Admin.
        </p>

        <p style="padding: 5px;">
          Regards<br /><br /><br />
          Team Knowhive
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Knowhive" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: message,
    });

    console.log("Student welcome email sent:", info.response);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Email error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
