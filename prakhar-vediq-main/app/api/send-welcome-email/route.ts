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

    const subject = "Welcome to Knowhive – Trainer Registration Confirmed!";

    const message = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #000; max-width: 600px; padding: 20px;">
        <h3 style="margin-top: 0;">Trainer Registration</h3>
        <p><strong>Subject: Welcome to Knowhive – Trainer Registration Confirmed!</strong></p>
        
        <p>Dear ${name},</p>
        
        <p>
          Welcome to <strong>Knowhive</strong>! We are thrilled to have you join our 
          platform as a trainer.
        </p>

        <p>Your registration has been <strong>successfully completed</strong> and your account is now active.</p>

        <h4 style="margin-bottom: 5px;">🔑 Your Login Details:</h4>
        <ul style="margin-top: 5px;">
          <li><strong>Login URL:</strong> <a href="https://knowhive.vercel.app/auth/login/teacher">https://knowhive.vercel.app/auth/login/teacher</a></li>
          <li><strong>Username:</strong> ${to}</li>
          <li><strong>Default Password:</strong> ${password}</li>
        </ul>

        <h4 style="margin-bottom: 5px;">📌 Next Steps:</h4>
        <ol style="margin-top: 5px;">
          <li>Log in to your trainer dashboard.</li>
          <li>Explore the course modules and resources assigned to you.</li>
        </ol>

        <p>If you need support, please feel free to contact us.</p>

        <p>Once again, welcome aboard! We look forward to a great partnership.</p>

        <p>
          Regards<br /><br />
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

    console.log("Teacher welcome email sent:", info.response);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Email error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
