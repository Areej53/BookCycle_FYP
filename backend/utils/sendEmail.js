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
    });
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
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (!process.env.SMTP_HOST) {
    console.log("Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
