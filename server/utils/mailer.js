const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'novahardware123@gmail.com', // fallback
        pass: process.env.EMAIL_PASS || 'dmyy mzzp llxx oqqq' // 16 digit app password
      }
    });

    const mailOptions = {
      from: `"NovaHardware Team" <${process.env.EMAIL_USER || 'novahardware123@gmail.com'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAILER] 📧 Email successfully sent to ${options.email} - ID: ${info.messageId} | Attachments: ${(options.attachments || []).length}`);
    return true;
  } catch (error) {
    console.error(`[MAILER ERROR] ❌ Failed to send email to ${options.email}`, error);
    return false;
  }
};

module.exports = sendEmail;
