import nodemailer from "nodemailer";

const emailEnabled = String(process.env.EMAIL_ENABLED || "true").toLowerCase() === "true";

const transporter =
  emailEnabled && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

export const sendSignupConfirmationEmail = async (to, loginId) => {
  if (!to || !transporter) return;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Your staff account is activated",
    text: `Your staff account with Login ID ${loginId} has been activated.`,
  });
};

export const sendPasswordResetOtpEmail = async (to, otp) => {
  if (!to || !transporter) return;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Password reset OTP",
    text: `Use this OTP to reset your password: ${otp}`,
  });
};

export const sendDeliveryApprovalEmail = async (to, deliveryCode) => {
  if (!to || !transporter) return;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Delivery approved",
    text: `Delivery ${deliveryCode} has been approved.`,
  });
};

