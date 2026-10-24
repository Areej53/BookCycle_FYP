const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  let transporter;
  
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log("SMTP server connection verified successfully");
    } catch (verifyError) {
      console.error("SMTP connection verification failed:", verifyError);
      throw new Error(`SMTP connection failed: ${verifyError.message}`);
    }
  } else {
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

  const mailOptions = {
    from: process.env.SMTP_FROM || '"BookCycle Support" <noreply@bookcycle.pk>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    // Add headers to improve deliverability
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    }
  };

  try {
    console.log(`Sending email to: ${options.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", options.email);
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    
    if (!process.env.SMTP_HOST) {
      console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (emailError) {
    console.error("Failed to send email to:", options.email);
    console.error("Email error details:", emailError.message);
    console.error("Error code:", emailError.code);
    throw emailError;
  }
};

module.exports = sendEmail;
