const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: "supragyabasnet704@gmail.com", // Your email address
    pass: "piyuhtkqpinjotod",           // App password
  },
});

const mailOptions = {
  from: "supragyabasnet704@gmail.com", // Your email
  to: "pramodbasnet704@gmail.com",     // Recipient's email
  subject: "Test Email",
  text: "This is a test email from my Node.js application.",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Email sent:", info.response);
  }
});
