require("dotenv").config();
const nodemailer = require("nodemailer");


const mailer = (email, subject, msg) => {
  const transporter = nodemailer.createTransport({
    service: "Outlook365", // Use "Outlook365" with a capital "O"
    auth: {
      user: process.env.User + "@outlook.com", // Set your username
      pass: process.env.Pass + "##**.", // Set your password
    },
  });

  const mailOptions = {
    from: `[Tenteru] <${process.env.User}@outlook.com>`,
    to: email,
    subject: subject,
    html: msg,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err); // Log the error
    } else {
      console.log(`Email sent to: ${email}`, info.response); // Log the successful response
    }
  });
};

module.exports = mailer;
