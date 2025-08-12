const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou 'hotmail', 'mailgun', etc.
  auth: {
    user: process.env.EMAIL_USER,      // 📧 ton email expéditeur
    pass: process.env.EMAIL_PASSWORD   // 🔐 mot de passe ou app password
  }
});

const sendMail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `"RecyTech" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });

  console.log("✅ E-mail envoyé:", info.messageId);
};

module.exports = sendMail;
