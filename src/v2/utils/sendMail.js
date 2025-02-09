const request = require("request");
const CustomError = require("./custom-error");
require("dotenv").config();
const nodemailer = require("nodemailer");
const user = process.env.EMAIL_ADDRESS;
const password = process.env.EMAIL_PASSWORD;
const WaitList = require("../models/waitlist.model");
const { mailer } = require("../config");
const { logConsole } = require("./logConsole");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mailer.USER,
    pass: mailer.PASSWORD,
  },
});

async function sendMail({ email }) {
  const name = email.split("@")[0];
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>DevSensor Registration</title>
    <link href="https://fonts.googleapis.com/css2?family=Mooli&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Mooli', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
    <!-- Main Container -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- Header with Device Image -->
        <tr>
            <td style="padding: 40px 20px; text-align: center; border-bottom: 1px solid #eeeeee;">
                <img src="https://iili.io/2DVx2aV.jpg" alt="DevSensor Device" width="512" height="auto" style="display: block; margin: 0 auto 20px; border-radius: 8px;">
                <h1 style="margin: 0; font-size: 28px; color: #222222; font-weight: 700;">
                    Welcome to DevSensor, ${name}
                </h1>
                <p style="color: #666666; margin: 8px 0 0; font-size: 16px;">
                    Optimize Your Well-being & Productivity
                </p>
            </td>
        </tr>

        <!-- Action Buttons Section -->
        <tr>
            <td style="padding: 40px 30px; text-align: center;">
                <div style="margin-bottom: 32px;">
                    <a href="https://app.devsensor.com" style="background-color: #222222; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 700; margin: 0 10px 15px; border: 2px solid #222222;">
                        Go to App
                    </a>
                    <a href="https://devsensor.com/buy" style="background-color: #ffffff; color: #222222; padding: 16px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 700; margin: 0 10px 15px; border: 2px solid #222222;">
                        Get Device
                    </a>
                </div>
            </td>
        </tr>

        <!-- Featured Blog Section -->
        <tr>
            <td style="padding: 0 30px 40px;">
                <div style="border: 1px solid #eeeeee; border-radius: 8px; padding: 24px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; color: #222222; font-weight: 700;">
                        Latest from Our Blog
                    </h2>
                    <h3 style="margin: 0 0 12px; font-size: 18px; color: #222222;">
                        Stay ahead with real-time health metrics
                    </h3>
                    <p style="color: #666666; margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
                        Productivity is a key factor in determining success. Learn how to stay ahead with real-time health metrics.
                    </p>
                    <a href="https://devsensor.com" style="color: #222222; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 8px;">
                        Read Article 
                        
                    </a>
                </div>
            </td>
        </tr>

        <!-- Footer Section -->
        <tr>
            <td style="padding: 32px 30px; background: #f8f9fa; border-top: 1px solid #eeeeee; border-radius: 0 0 12px 12px;">
                <table width="100%">
                   <tr>
                          <td style="padding-bottom: 24px; border-bottom: 1px solid #eeeeee;">
                              <p style="font-size: 14px; color: #666666; margin: 0 0 16px; letter-spacing: -0.1px;">Quick Access:</p>
                              <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                                  <a href="https://devsensor.com" 
                                    style="color: #222222;  
                                            text-decoration: none; 
                                            font-size: 14px; 
                                            font-weight: 700;
                                            margin-right: 32px;
                                            padding: 8px 0;">
                                      Website
                                  </a>
                                  <a href="https://app.devsensor.com" 
                                    style="color: #222222;  
                                            text-decoration: none; 
                                            font-size: 14px; 
                                            font-weight: 700;
                                            margin-right: 32px;
                                            padding: 8px 0;">
                                      App
                                  </a>
                                  <a href="https://x.com/0xChimdi" 
                                    style="color: #222222;  
                                            text-decoration: none; 
                                            font-size: 14px; 
                                            font-weight: 700;
                                            padding: 8px 0;">
                                      Twitter
                                  </a>
                              </div>
                          </td>
                      </tr>
                    <tr>
                        <td style="padding-top: 24px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                                <div>
                                  
                                </div>
                                <div>
                                    <p style="font-size: 12px; color: #666666; margin: 0;">
                                        © <span id="currentYear"></span> DevSensor
                                    </p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Dynamic Year Script -->
    <script>
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    </script>
</body>
</html>`;

  {
    /* <p style="font-size: 12px; color: #666666; margin: 0 0 8px;">
DevSensor Inc.<br>
1209 Orange Street, Wilmington<br>
Delaware, 19801, USA
</p> */
  }

  const messageOptions = {
    from: user,
    to: email,
    subject: `Stay aware, Stay ahead`,
    html,
  };

  try {
    const info = await transporter.sendMail(messageOptions);
    logConsole("Email sent:", info.response);
    return info.response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new CustomError(error.message, 500);
  }
}

async function resetPassword({ email, otp }) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>DevSensor Secure Access</title>
      <link href="https://fonts.googleapis.com/css2?family=Mooli&display=swap" rel="stylesheet">
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Mooli', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
      <!-- Main Container -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <!-- Security Header -->
          <tr>
              <td style="padding: 32px 40px 24px; border-bottom: 1px solid #eeeeee; background: #f8f9fa;">
                  <table width="100%">
                      <tr>
                          <td style="text-align: left;">
                              <div style="display: flex; align-items: center; gap: 12px;">
                                  <img src="https://iili.io/2DHovdF.jpg" alt="DevSensor" width="32" style="display: block;">
                                  <h1 style="margin: 0; font-size: 24px; color: #222222; font-weight: 700; letter-spacing: -0.5px;">Password Reset Verification</h1>
                              </div>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>

          <!-- OTP Content -->
          <tr>
              <td style="padding: 40px 40px 32px;">
                  <div style="margin-bottom: 32px;">
                      <p style="font-size: 16px; line-height: 1.6; color: #444444; margin: 0 0 24px; letter-spacing: -0.1px;">
                          We received a request to reset your DevSensor account password.<br>
                          Use this One-Time Password (OTP) to verify your identity:
                      </p>

                      <!-- OTP Code Display -->
                     <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 32px;">
                        <div style="display: inline-flex; gap: 20px; margin: 0 auto; font-family: 'Mooli', sans-serif;">
                          ${Array.from(otp)
                            .map(
                              (digit) => `
                            <span style="display: inline-block; 
                                        width: 50px; 
                                        height: 50px; 
                                        border: 2px solid #eeeeee; 
                                        border-radius: 8px; 
                                        line-height: 50px; 
                                        font-size: 22px; 
                                        font-weight: 700; 
                                        color: #222222;
                                        margin: 0 4px;">
                              ${digit}
                            </span>
                          `
                            )
                            .join("")}
                        </div>
                      </div>

                      <div style="text-align: center;">
                          <p style="font-size: 13px; color: #666666; margin: 0;">
                              OTP Valid for: <strong>15 minutes</strong><br>
                              Received this by mistake? <a href="mailto:support@devsensor.com" style="color: #222222; text-decoration: underline;">Contact Security</a>
                          </p>
                      </div>
                  </div>
              </td>
          </tr>

          <!-- Universal Footer -->
          <tr>
              <td style="padding: 32px 40px; background: #f8f9fa; border-top: 1px solid #eeeeee; border-radius: 0 0 12px 12px;">
                  <table width="100%">
                    <tr>
                      <td style="padding-bottom: 24px; border-bottom: 1px solid #eeeeee;">
                          <p style="font-size: 14px; color: #666666; margin: 0 0 16px; letter-spacing: -0.1px;">Quick Access:</p>
                          <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                              <a href="https://devsensor.com" 
                                style="color: #222222;  
                                        text-decoration: none; 
                                        font-size: 14px; 
                                        font-weight: 700;
                                        margin-right: 32px;
                                        padding: 8px 0;">
                                  Website
                              </a>
                              <a href="https://app.devsensor.com" 
                                style="color: #222222;  
                                        text-decoration: none; 
                                        font-size: 14px; 
                                        font-weight: 700;
                                        margin-right: 32px;
                                        padding: 8px 0;">
                                  App
                              </a>
                              <a href="https://x.com/0xChimdi" 
                                style="color: #222222;  
                                        text-decoration: none; 
                                        font-size: 14px; 
                                        font-weight: 700;
                                        padding: 8px 0;">
                                  Twitter
                              </a>
                          </div>
                      </td>
                  </tr>
                      
                      <tr>
                          <td style="padding-top: 24px;">
                              <div style="display: flex; justify-content: space-between; align-items: center; font-family: 'Mooli', sans-serif;">
                                  <div>
                                     
                                  </div>
                                  <div style="text-align: right;">
                                      <p style="font-size: 12px; color: #666666; margin: 0;">
                                          © ${new Date().getFullYear()} DevSensor
                                      </p>
                                  </div>
                              </div>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>
  `;

  {
    //   <p style="font-size: 12px; color: #666666; margin: 0 0 8px; letter-spacing: -0.1px;">
    //   DevSensor Inc.<br>
    //   1209 Orange Street, Wilmington<br>
    //   Delaware, 19801, USA
    // </p>
  }

  const messageOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `DevSensor Password Reset Code`,
    html,
  };

  try {
    const info = await transporter.sendMail(messageOptions);
    logConsole("Email sent:", info.response);
    return info.response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new CustomError(error.message, 500);
  }
}

module.exports = { sendMail, resetPassword };