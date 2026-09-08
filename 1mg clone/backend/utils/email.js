const nodemailer = require('nodemailer');

function mailer() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

async function sendVerificationEmail(email, token) {
  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
  const verificationUrl = new URL('/verify-email', frontendUrl);
  verificationUrl.searchParams.set('token', token);
  await mailer().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your 1mg account',
    text: `Verify your email address by opening: ${verificationUrl.toString()}`,
    html: `<p>Welcome to 1mg.</p><p><a href="${verificationUrl.toString()}">Verify your email address</a></p>`,
  });
}

module.exports = { sendVerificationEmail };
