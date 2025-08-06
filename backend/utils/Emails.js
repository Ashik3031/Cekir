require("dotenv").config();
const nodemailer = require("nodemailer");

// Use explicit SMTP transport with Gmail settings
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // 587 is also valid but 465 is for secure SSL
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD, // App Password only
  },
});

exports.sendMail = async (receiverEmail, subject, body) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body,
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email send error:", err.message);
  }
};
