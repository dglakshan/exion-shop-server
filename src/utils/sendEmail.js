import expressAsyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import { config } from "../config/appConfig.js";

export const sendOtpEmail = async (email, OTP) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: false,
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    });

    const mailOptions = {
      from: `"Exion Computer" <pasindulakshanun@gmail.com>`,
      to: email,
      subject: "exion computer - Your OTP verification code",
      html: `
     <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 500px;">
          <h2 style="color: #333;">Welcome to exion computer</h2>
          <p>Please use the following One-Time Password (OTP) to verify your registration. This code is only valid for <b>5 minutes</b>.</p>
          <h1 style="color: #2196F3; letter-spacing: 5px; font-size: 36px; text-align: center; margin: 20px 0;">${OTP}</h1>
          <p style="color: #777; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
     </div>
    `,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (err) {
    throw err;
  }
};

export const sendPaswordEmail = async (email, name, password) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: false,
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    });

    const mailOptions = {
      from: `"Exion Computer" <${config.emailUser}>`,
      to: email,
      subject: "Exion Computer - Temporary Login Password",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px; margin: 0 auto; color: #333;">
      <h2 style="color: #2196F3; margin-bottom: 20px;">Welcome to Exion Computer, ${name}!</h2>
      <p style="font-size: 14px; line-height: 1.5; color: #555;">
        Your account has been successfully created. Below is your <strong>temporary login password</strong>. 
        For security purposes, please log in and change this password <strong>immediately</strong>.
      </p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; margin: 20px 0;">
        <p style="margin: 5px 0; font-size: 14px;"><strong>Email:</strong> <span style="color: #1a0dab;">${email}</span></p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Temporary Password:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 3px; font-size: 15px; font-family: monospace;">${password}</code></p>
      </div>

      <p style="color: #777; font-size: 12px; margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
        This is an automated email. Please do not reply directly to this message.
      </p>
    </div>
  `,
    };

    const info = await transporter.sendMail(mailOptions);

    return info;
  } catch (err) {
    throw err;
  }
};
