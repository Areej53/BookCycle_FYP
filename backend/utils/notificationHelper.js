const { Notification, User } = require('../models');
const sendEmail = require('./sendEmail');

const sendSMS = async (phone, message) => {
  if (!phone) return;
  const smsKey = process.env.SMS_API_KEY || process.env.TWILIO_ACCOUNT_SID;
  if (!smsKey) {
    console.log(`[SMS Info] Provider not configured. SMS log for ${phone}: ${message}`);
    return;
  }
  try {
    // If a provider is configured, send here
    console.log(`[SMS Sent] To ${phone}: ${message}`);
  } catch (err) {
    console.error(`SMS send failed for ${phone}:`, err.message);
  }
};

const notifyUserAndEmail = async ({
  userId,
  userEmail,
  userPhone,
  subject,
  message,
  type = 'order',
  orderId = null,
  actionLink = null,
  sendSmsFlag = false
}) => {
  try {
    let targetEmail = userEmail;
    let targetPhone = userPhone;

    if (userId && (!targetEmail || !targetPhone)) {
      const user = await User.findByPk(userId);
      if (user) {
        if (!targetEmail) targetEmail = user.email;
        if (!targetPhone) targetPhone = user.phone;
      }
    }

    // 1. In-App Notification (Database record)
    let notification = null;
    if (userId) {
      notification = await Notification.create({
        userId,
        message,
        type,
        orderId,
        actionLink,
        isRead: false
      });
    }

    // 2. Email Notification strictly to targetEmail ONLY
    if (targetEmail && typeof targetEmail === 'string' && targetEmail.includes('@')) {
      const cleanEmail = targetEmail.trim();
      console.log(`[Notification Email] Sending exclusively to: ${cleanEmail} | Subject: ${subject}`);
      sendEmail({
        email: cleanEmail,
        subject: subject || "BookCycle Notification",
        message: message,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BookCycle Notification</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #13493C 0%, #1a6b5a 100%); padding: 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px;">BookCycle</h1>
                <p style="margin: 10px 0 0; color: #DDA15E; font-size: 14px; font-weight: 500;">Your Trusted Book Exchange Platform</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="margin: 0 0 20px; color: #13493C; font-size: 22px; font-weight: 600;">${subject || "BookCycle Notification"}</h2>
                <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">${message}</p>
                ${orderId ? `
                <div style="background-color: #FAF9F0; border-left: 4px solid #13493C; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #13493C; font-size: 14px; font-weight: 600;">Order Reference: #${orderId}</p>
                </div>
                ` : ''}
                
                <!-- Call to Action -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${actionLink || 'https://bookcycle.com/dashboard'}" style="display: inline-block; background-color: #BC6C25; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; transition: background-color 0.3s;">View Order Details</a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #13493C; padding: 25px 30px; text-align: center;">
                <p style="margin: 0 0 10px; color: #ffffff; font-size: 14px;">Need help? Contact us at <a href="mailto:support@bookcycle.com" style="color: #DDA15E; text-decoration: none;">support@bookcycle.com</a></p>
                <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 12px;">© 2026 BookCycle. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      }).catch(err => {
        console.error(`[Email Error] Failed to send email to ${cleanEmail}:`, err);
      });
    }

    // 3. SMS Notification (if provider available)
    if (sendSmsFlag && targetPhone) {
      sendSMS(targetPhone, message);
    }

    return notification;
  } catch (error) {
    console.error("notifyUserAndEmail error:", error);
    return null;
  }
};

const notifyAdminUsers = async ({ subject, message, orderId = null }) => {
  try {
    // 1. Check if admin users exist in database
    const adminUsers = await User.findAll({ where: { role: 'admin' } });
    let adminNotified = false;

    if (adminUsers && adminUsers.length > 0) {
      for (const admin of adminUsers) {
        if (admin.email && admin.email.includes('@')) {
          adminNotified = true;
          await notifyUserAndEmail({
            userId: admin.id,
            userEmail: admin.email.trim(),
            userPhone: admin.phone,
            subject,
            message,
            type: 'order',
            orderId
          });
        }
      }
    }

    // 2. If no DB admin exists, send exclusively to configured ADMIN_EMAIL from environment
    if (!adminNotified && process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.includes('@')) {
      const adminEmail = process.env.ADMIN_EMAIL.trim();
      await notifyUserAndEmail({
        userEmail: adminEmail,
        subject,
        message,
        type: 'order',
        orderId
      });
    }
  } catch (err) {
    console.error("notifyAdminUsers error:", err);
  }
};

module.exports = {
  notifyUserAndEmail,
  notifyAdminUsers,
  sendSMS
};
