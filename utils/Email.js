const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "cpetdarulhuda@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
  port: 465,
  secure: true,
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".hbs",
      partialsDir: path.join(process.cwd("/views")),
      defaultLayout: false,
    },
    viewPath: "./views",
    extName: ".hbs",
  })
);
module.exports = class Email {
  constructor({ email, url, name, res, subject, title, otpToken, currentUrl }) {
    this.email = email;
    this.url = url;
    this.from = `CPET Darul Huda`;
    this.subject = subject;
    this.res = res;
    this.title = title;
    this.name = name;
    this.otpToken = otpToken;
    this.currentUrl = currentUrl;
  }

  async send(template) {
    //1) render HTML based on pug
    try {
      const mailOptions = {
        from: "cpet.dhiu.in",
        to: this.email,
        subject: "subject",
        template: template,
        context: {
          name: this.name,
          subject: this.subject,
          url: this.url,
          title: this.title,
          otpToken: this.otpToken,
          currentUrl: this.currentUrl,
        },
      };
      // 3) create a trasport and send
      let data = await transporter.sendMail(mailOptions); //sendMail is build in function
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  async sendWelcome() {
    await this.send("welcome", "welcome to natours family");
  }
};
