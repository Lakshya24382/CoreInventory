const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (toEmail, otp) => {
  await resend.emails.send({
    from: "CoreInventory <onboarding@resend.dev>",
    to: toEmail,
    subject: "Your password reset OTP",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">CoreInventory</h2>
        <p>You requested a password reset. Use this OTP to continue:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This OTP expires in <strong>10 minutes</strong>.
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };