
import "dotenv/config";
import nodemailer from "nodemailer";

const { MAILTRAP_USERNAME, MAILTRAP_PASSWORD } = process.env;

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: MAILTRAP_USERNAME,
    pass: MAILTRAP_PASSWORD,
  },
});


const createMessage = (mailTo, verificationToken) => {
  return {
    to: mailTo,
    from: "silaveri777@gmail.com",
    subject: "Welcome to Phonebook! Please Verify",
    html: `<h1 style="color: red">Click on link for verify your email   <a href="http://localhost:3000/users/verify/${verificationToken}">Verify Email</a></h1>`,
    text: `Click on link for verify your email href="/users/verify/${verificationToken}"`,
  };
};

const sendVerificationEmail = async (mailTo, verificationToken) => {
  const message = createMessage(mailTo, verificationToken);
  try {
    await transport.sendMail(message);
  } catch (error) {
    next(error);
  }
};

export default sendVerificationEmail;