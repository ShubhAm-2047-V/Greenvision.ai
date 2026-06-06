import nodemailer from 'nodemailer';
import { generatePdfBuffer } from './pdfGenerator';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendReportEmail = async (toEmail, farm, prediction) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Skipping email generation.");
    return;
  }

  const subject = `Agrovision AI: Farm Analysis Report for ${farm.name}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #10b981; text-align: center;">Agrovision AI Report</h2>
      <p>Hello,</p>
      <p>Your automated farm analysis for <strong>${farm.name}</strong> is ready. Here is a summary of the AI's findings:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Analysis Summary</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          <li style="margin-bottom: 10px;"><strong>Crop Recommended:</strong> <span style="text-transform: capitalize;">${prediction.crop}</span></li>
          <li style="margin-bottom: 10px;"><strong>Farm Health Score:</strong> ${prediction.farm_health_score}/100</li>
          <li style="margin-bottom: 10px;"><strong>Soil Health Score:</strong> ${prediction.soil_health_score}/100</li>
          <li style="margin-bottom: 10px;"><strong>Expected Yield:</strong> ${prediction.expected_yield}</li>
          <li style="margin-bottom: 10px;"><strong>Expected Profit:</strong> <span style="color: #10b981; font-weight: bold;">${prediction.expected_profit}</span></li>
        </ul>
      </div>
      
      <p><strong>Expert Insight:</strong><br/>${prediction.explanation}</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="https://agro-mind-ai-pied.vercel.app/predict" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Full Dashboard</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">
        This is an automated message from Agrovision AI. Please do not reply to this email.
      </p>
    </div>
  `;

  try {
    const pdfBuffer = await generatePdfBuffer(prediction, farm.name);
    const pdfBufferNode = Buffer.from(pdfBuffer); // Ensure it's a Node Buffer for nodemailer

    const info = await transporter.sendMail({
      from: `"Agrovision AI" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Agrovision_Report_${farm.name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBufferNode,
          contentType: 'application/pdf',
        },
      ],
    });
    console.log("Email sent successfully: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending report email: ", error);
    throw error;
  }
};
