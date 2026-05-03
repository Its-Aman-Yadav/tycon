'use server'

import nodemailer from 'nodemailer';

export async function sendEnquiry(formData: FormData) {
  const name = formData.get('name') as string;
  const company = formData.get('company') as string;
  const industry = formData.get('industry') as string;
  const country = formData.get('country') as string;
  const product = formData.get('product') as string;
  const model = formData.get('model') as string || '';
  const application = formData.get('application') as string || '';
  const requirementType = formData.get('requirementType') as string || '';
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const message = (formData.get('message') || formData.get('requirements')) as string;
  const requestBrochure = formData.get('requestBrochure') === 'true';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // true for port 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"TYCO Website Enquiry" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: `New Enquiry from ${name} - ${company}`,
    text: `
      New Enquiry Details:
      -------------------
      Name: ${name}
      Company: ${company}
      Email: ${email}
      Phone: ${phone}
      Country: ${country}
      
      Industry: ${industry}
      Product: ${product} ${model ? `(Model: ${model})` : ''}
      Application Type: ${application}
      Requirement Type: ${requirementType}
      
      Message:
      ${message}
      
      Requested Brochure: ${requestBrochure ? 'Yes' : 'No'}
    `,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #F58220; margin-bottom: 20px;">New Website Enquiry</h2>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Contact Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Country:</strong> ${country}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Requirement Details</h3>
          <p><strong>Industry:</strong> ${industry}</p>
          <p><strong>Product:</strong> ${product}</p>
          ${model ? `<p><strong>Model:</strong> ${model}</p>` : ''}
          <p><strong>Application:</strong> ${application}</p>
          <p><strong>Type:</strong> ${requirementType}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h3 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Message</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
          <strong>Requested Brochure:</strong> ${requestBrochure ? 'Yes' : 'No'}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send enquiry. Please try again later.' };
  }
}
