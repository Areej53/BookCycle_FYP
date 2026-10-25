const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter;
  
  const host = process.env.SMTP_HOST || "";
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const port = process.env.SMTP_PORT || "587";

  console.log(`[Email Config] Host: ${host}, Port: ${port}, User: ${user}`);

  if (host.includes("gmail") || user.endsWith("@gmail.com")) {
    console.log(`[Email] Using Gmail service`);
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else if (host) {
    console.log(`[Email] Using custom SMTP host: ${host}:${port}`);
    transporter = nodemailer.createTransport({
      host: host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    console.log(`[Email] No SMTP config, using test account`);
    // Generate test SMTP service account from ethereal.email if no settings provided
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Strict recipient email validation - prevent sending to invalid or empty recipients
  if (!options || !options.email || typeof options.email !== "string" || !options.email.includes("@")) {
    console.warn(`[Email Skipped] Invalid or missing recipient email: "${options?.email}". Email was not sent.`);
    return null;
  }

  const recipient = options.email.trim();

  const mailOptions = {
    from: process.env.SMTP_FROM || `"BookCycle" <noreply@bookcycle.com>`,
    to: recipient,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  console.log(`[Email] Attempting to send to: ${recipient}, Subject: ${options.subject}`);
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email SUCCESS] Email delivered to ${recipient}. MessageId: ${info.messageId}`);
    
    if (!host && !user) {
      console.log("Email preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error(`[Email ERROR] Failed to send email to ${recipient}:`, error);
    throw error;
  }
};

module.exports = sendEmail;
