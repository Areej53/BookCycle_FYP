const { User, RiderApplication, Notification } = require("../models");
const sendEmail = require("../utils/sendEmail");
const fs = require('fs');
const path = require('path');

const saveBase64Image = (base64String, prefix = 'img') => {
  if (!base64String) return null;
  if (!base64String.startsWith('data:image')) return base64String;

  const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return base64String;

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  const filename = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
  const filepath = path.join(__dirname, '../uploads', filename);

  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}`;
};

const submitRiderApplication = async (req, res) => {
  try {
    await RiderApplication.sync();
    const {
      fullName,
      email,
      phone,
      password,
      cnic,
      address,
      city,
      profileImage,
      vehicleType,
      vehicleNumber,
      drivingLicenseNumber,
      drivingLicenseImage,
      confirmation
    } = req.body;

    if (!confirmation) {
      return res.status(400).json({ msg: "You must confirm that the information provided is correct." });
    }

    if (!fullName || !email || !phone || !password || !cnic || !address || !city || !vehicleType || !vehicleNumber || !drivingLicenseNumber) {
      return res.status(400).json({ msg: "Please fill all required fields." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pk|org|net|edu|gov)$/i;
    const isBadGmail = /@gmai\.com|@gmial\.com|@gamil\.com/i.test(cleanEmail);

    if (!emailRegex.test(cleanEmail) || isBadGmail) {
      return res.status(400).json({ msg: "Please provide a valid email address." });
    }

    // Check if user exists or create user
    let user = await User.findOne({ where: { email: cleanEmail } });

    if (user) {
      // Check if user already has a rider application
      const existingApp = await RiderApplication.findOne({ where: { userId: user.id } });
      if (existingApp) {
        if (existingApp.status === 'PENDING') {
          return res.status(400).json({ msg: "Your Rider application is currently under review." });
        }
        if (existingApp.status === 'APPROVED') {
          return res.status(400).json({ msg: "Your Rider application has already been approved." });
        }
        if (existingApp.status === 'SUSPENDED') {
          return res.status(400).json({ msg: "Your Rider account is currently suspended. Please contact support." });
        }
      }
    } else {
      // Create new user account
      user = await User.create({
        name: fullName.trim(),
        email: cleanEmail,
        password: password,
        phone: phone.trim(),
        role: 'customer',
        interests: ['Rider Services']
      });
    }

    // Save image files if provided
    const savedProfileImage = saveBase64Image(profileImage, 'rider-profile');
    const savedLicenseImage = saveBase64Image(drivingLicenseImage, 'rider-license');

    // Create or update RiderApplication
    let application = await RiderApplication.findOne({ where: { userId: user.id } });

    if (application) {
      // Re-application after rejection
      application.fullName = fullName.trim();
      application.phone = phone.trim();
      application.cnic = cnic.trim();
      application.address = address.trim();
      application.city = city.trim();
      application.profileImage = savedProfileImage || application.profileImage;
      application.vehicleType = vehicleType.trim();
      application.vehicleNumber = vehicleNumber.trim();
      application.drivingLicenseNumber = drivingLicenseNumber.trim();
      application.drivingLicenseImage = savedLicenseImage || application.drivingLicenseImage;
      application.status = 'PENDING';
      application.rejectionReason = null;
      application.submittedAt = new Date();
      await application.save();
    } else {
      application = await RiderApplication.create({
        userId: user.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        cnic: cnic.trim(),
        address: address.trim(),
        city: city.trim(),
        profileImage: savedProfileImage,
        vehicleType: vehicleType.trim(),
        vehicleNumber: vehicleNumber.trim(),
        drivingLicenseNumber: drivingLicenseNumber.trim(),
        drivingLicenseImage: savedLicenseImage,
        status: 'PENDING',
        submittedAt: new Date()
      });
    }

    // Create notification for the user
    try {
      await Notification.create({
        userId: user.id,
        type: 'rider_application_submitted',
        message: 'Your Rider application has been submitted successfully and is currently under review.',
        isRead: false
      });
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr);
    }

    res.status(201).json({
      msg: 'Your Rider application has been submitted successfully. Your application is currently under review. You will receive an email when the Admin makes a decision.',
      status: 'PENDING',
      application
    });
  } catch (error) {
    console.error('Submit Rider Application error:', error);
    res.status(500).json({ msg: error.message || 'Failed to submit Rider application.' });
  }
};

const getRiderRequests = async (req, res) => {
  try {
    await RiderApplication.sync();
    const applications = await RiderApplication.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'createdAt']
        }
      ],
      order: [['submittedAt', 'DESC']]
    });

    res.status(200).json({ applications });
  } catch (error) {
    console.error('Get Rider Requests error:', error);
    res.status(500).json({ msg: 'Failed to fetch rider requests.' });
  }
};

const getRiderApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await RiderApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ msg: 'Rider application not found.' });
    }

    res.status(200).json({ application });
  } catch (error) {
    console.error('Get Rider Application detail error:', error);
    res.status(500).json({ msg: 'Failed to fetch rider application details.' });
  }
};

const approveRiderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const application = await RiderApplication.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!application) {
      return res.status(404).json({ msg: 'Rider application not found.' });
    }

    application.status = 'APPROVED';
    application.reviewedAt = new Date();
    application.reviewedBy = String(adminId);
    await application.save();

    // Update User role
    const user = application.user || (await User.findByPk(application.userId));
    if (user) {
      user.role = 'rider';
      await user.save();
    }

    // Create Notification
    try {
      await Notification.create({
        userId: application.userId,
        type: 'rider_approved',
        message: 'Your Rider application for BookCycle has been approved! You are now an authorized Rider.',
        isRead: false
      });
    } catch (notifErr) {
      console.error('Rider approval notification failed:', notifErr);
    }

    // Send Approval Email
    let emailSent = false;
    let emailError = null;
    const targetEmail = user ? user.email : null;

    if (targetEmail) {
      try {
        await sendEmail({
          email: targetEmail,
          subject: 'BookCycle Rider Application Approved',
          message: `Hello ${application.fullName},

Your Rider application for BookCycle has been reviewed and approved.

You can now use your BookCycle account as an approved Rider.

Thank you,
BookCycle Team`,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #13493C;">
            <h2 style="color: #13493C;">BookCycle Rider Application Approved</h2>
            <p>Hello <strong>${application.fullName}</strong>,</p>
            <p>Your Rider application for BookCycle has been reviewed and <strong>approved</strong>.</p>
            <p>You can now use your BookCycle account as an approved Rider.</p>
            <br/>
            <p>Thank you,<br/><strong>BookCycle Team</strong></p>
          </div>`
        });
        emailSent = true;
      } catch (mailErr) {
        console.error('Failed to send rider approval email:', mailErr);
        emailError = mailErr.message;
      }
    }

    const successMsg = emailSent
      ? 'Rider application approved successfully. Approval email has been sent to the registered email address.'
      : 'Rider application approved successfully, but the email could not be sent. Please check the email configuration/logs.';

    res.status(200).json({
      msg: successMsg,
      emailSent,
      emailError,
      application
    });
  } catch (error) {
    console.error('Approve Rider Request error:', error);
    res.status(500).json({ msg: 'Failed to approve Rider application.' });
  }
};

const rejectRiderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ msg: 'Rejection reason is required.' });
    }

    const application = await RiderApplication.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!application) {
      return res.status(404).json({ msg: 'Rider application not found.' });
    }

    application.status = 'REJECTED';
    application.rejectionReason = rejectionReason.trim();
    application.reviewedAt = new Date();
    application.reviewedBy = String(adminId);
    await application.save();

    // Create Notification
    try {
      await Notification.create({
        userId: application.userId,
        type: 'rider_rejected',
        message: `Your Rider application has been rejected. Reason: ${rejectionReason.trim()}`,
        isRead: false
      });
    } catch (notifErr) {
      console.error('Rider rejection notification failed:', notifErr);
    }

    // Send Rejection Email
    let emailSent = false;
    let emailError = null;
    const user = application.user || (await User.findByPk(application.userId));
    const targetEmail = user ? user.email : null;

    if (targetEmail) {
      try {
        await sendEmail({
          email: targetEmail,
          subject: 'BookCycle Rider Application Update',
          message: `Hello ${application.fullName},

Your Rider application for BookCycle has been reviewed.

Unfortunately, your application has not been approved at this time.

Reason:
${rejectionReason.trim()}

If applicable, please review the information/documents and contact the BookCycle team for further assistance.

Thank you,
BookCycle Team`,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #13493C;">
            <h2 style="color: #13493C;">BookCycle Rider Application Update</h2>
            <p>Hello <strong>${application.fullName}</strong>,</p>
            <p>Your Rider application for BookCycle has been reviewed.</p>
            <p>Unfortunately, your application has not been approved at this time.</p>
            <div style="background-color: #FFF3CD; padding: 12px; border-radius: 6px; border-left: 4px solid #FFC107; margin: 15px 0;">
              <strong>Reason:</strong><br/>
              ${rejectionReason.trim()}
            </div>
            <p>If applicable, please review the information/documents and contact the BookCycle team for further assistance.</p>
            <br/>
            <p>Thank you,<br/><strong>BookCycle Team</strong></p>
          </div>`
        });
        emailSent = true;
      } catch (mailErr) {
        console.error('Failed to send rider rejection email:', mailErr);
        emailError = mailErr.message;
      }
    }

    const successMsg = emailSent
      ? 'Rider application rejected successfully. Rejection email has been sent to the registered email address.'
      : 'Rider application rejected successfully, but the email could not be sent. Please check the email configuration/logs.';

    res.status(200).json({
      msg: successMsg,
      emailSent,
      emailError,
      application
    });
  } catch (error) {
    console.error('Reject Rider Request error:', error);
    res.status(500).json({ msg: 'Failed to reject Rider application.' });
  }
};

const suspendRider = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const application = await RiderApplication.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    if (!application) {
      return res.status(404).json({ msg: 'Rider application not found.' });
    }

    application.status = 'SUSPENDED';
    application.reviewedAt = new Date();
    application.reviewedBy = String(adminId);
    await application.save();

    try {
      await Notification.create({
        userId: application.userId,
        type: 'rider_suspended',
        message: 'Your Rider account has been suspended.',
        isRead: false
      });
    } catch (notifErr) {
      console.error('Rider suspension notification failed:', notifErr);
    }

    // Send Suspension Email
    let emailSent = false;
    const user = application.user || (await User.findByPk(application.userId));
    const targetEmail = user ? user.email : null;

    if (targetEmail) {
      try {
        await sendEmail({
          email: targetEmail,
          subject: 'BookCycle Rider Account Suspended',
          message: `Hello ${application.fullName},

Your BookCycle Rider account has been suspended.

Please contact support for further assistance.

Thank you,
BookCycle Team`,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #13493C;">
            <h2 style="color: #C0392B;">BookCycle Rider Account Suspended</h2>
            <p>Hello <strong>${application.fullName}</strong>,</p>
            <p>Your BookCycle Rider account has been <strong>suspended</strong>.</p>
            <p>Please contact BookCycle support for further assistance.</p>
            <br/>
            <p>Thank you,<br/><strong>BookCycle Team</strong></p>
          </div>`
        });
        emailSent = true;
      } catch (mailErr) {
        console.error('Failed to send rider suspension email:', mailErr);
      }
    }

    res.status(200).json({
      msg: emailSent
        ? 'Rider account suspended successfully. Notification email sent.'
        : 'Rider account suspended successfully.',
      emailSent,
      application
    });
  } catch (error) {
    console.error('Suspend Rider error:', error);
    res.status(500).json({ msg: 'Failed to suspend Rider.' });
  }
};

const reactivateRider = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const application = await RiderApplication.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    if (!application) {
      return res.status(404).json({ msg: 'Rider application not found.' });
    }

    application.status = 'APPROVED';
    application.reviewedAt = new Date();
    application.reviewedBy = String(adminId);
    await application.save();

    // Send Reactivation Email
    let emailSent = false;
    const user = application.user || (await User.findByPk(application.userId));
    const targetEmail = user ? user.email : null;

    if (targetEmail) {
      try {
        await sendEmail({
          email: targetEmail,
          subject: 'BookCycle Rider Account Reactivated',
          message: `Hello ${application.fullName},

Your BookCycle Rider account has been reactivated.

You can now continue to use your BookCycle account as an approved Rider.

Thank you,
BookCycle Team`,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #13493C;">
            <h2 style="color: #13493C;">BookCycle Rider Account Reactivated</h2>
            <p>Hello <strong>${application.fullName}</strong>,</p>
            <p>Your BookCycle Rider account has been <strong>reactivated</strong>.</p>
            <p>You can now continue to use your BookCycle account as an approved Rider.</p>
            <br/>
            <p>Thank you,<br/><strong>BookCycle Team</strong></p>
          </div>`
        });
        emailSent = true;
      } catch (mailErr) {
        console.error('Failed to send rider reactivation email:', mailErr);
      }
    }

    res.status(200).json({
      msg: emailSent
        ? 'Rider account reactivated successfully. Notification email sent.'
        : 'Rider account reactivated successfully.',
      emailSent,
      application
    });
  } catch (error) {
    console.error('Reactivate Rider error:', error);
    res.status(500).json({ msg: 'Failed to reactivate Rider.' });
  }
};

const getRiderStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const application = await RiderApplication.findOne({ where: { userId } });

    if (!application) {
      return res.status(200).json({ status: null, application: null });
    }

    res.status(200).json({
      status: application.status,
      rejectionReason: application.rejectionReason,
      application
    });
  } catch (error) {
    console.error('Get Rider Status error:', error);
    res.status(500).json({ msg: 'Failed to fetch rider status.' });
  }
};

module.exports = {
  submitRiderApplication,
  getRiderRequests,
  getRiderApplicationById,
  approveRiderRequest,
  rejectRiderRequest,
  suspendRider,
  reactivateRider,
  getRiderStatus
};
