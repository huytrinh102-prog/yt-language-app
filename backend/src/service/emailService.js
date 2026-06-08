import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: String(process.env.SMTP_PASS || "").replace(/\s/g, ""),
  },
});
const sendResetPasswordEmail = async (toEmail, resetLink) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Reset your password",
    html: `
      <h2>Reset password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 10 minutes.</p>
    `,
  });
};
export default {
  sendResetPasswordEmail,
};
