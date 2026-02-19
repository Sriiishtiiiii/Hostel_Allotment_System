import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@nith.ac.in';
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const transporter = createTransporter();
  const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"NITH Hostel System" <${FROM}>`,
    to: email,
    subject: 'Verify your email — NITH Hostel Allotment',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">NIT Hamirpur — Hostel Allotment System</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verifyUrl}" style="
          display: inline-block;
          background-color: #1e3a5f;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 16px 0;
        ">Verify Email</a>
        <p style="color: #666;">This link expires in 24 hours.</p>
        <p style="color: #666; font-size: 12px;">If you didn't create this account, ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  const transporter = createTransporter();
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"NITH Hostel System" <${FROM}>`,
    to: email,
    subject: 'Reset your password — NITH Hostel Allotment',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">NIT Hamirpur — Hostel Allotment System</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          background-color: #1e3a5f;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 16px 0;
        ">Reset Password</a>
        <p style="color: #666;">This link expires in 1 hour.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

export const sendBatchActivationEmail = async (
  email: string,
  name: string,
  roundNumber: number,
  deadline: string
) => {
  const transporter = createTransporter();
  const selectUrl = `${BASE_URL}/student/select-room`;

  await transporter.sendMail({
    from: `"NITH Hostel System" <${FROM}>`,
    to: email,
    subject: `Your room selection window is open — Round ${roundNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">NIT Hamirpur — Hostel Allotment System</h2>
        <p>Hi ${name},</p>
        <p>Your batch (Round ${roundNumber}) is now active. You can select your room preferences.</p>
        <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        <a href="${selectUrl}" style="
          display: inline-block;
          background-color: #16a34a;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 16px 0;
        ">Select Your Room</a>
        <p style="color: #e11d48; font-weight: bold;">Submit your preferences before the deadline. Missing the deadline means manual assignment.</p>
      </div>
    `,
  });
};

export const sendAllotmentConfirmationEmail = async (
  email: string,
  name: string,
  hostelName: string,
  roomNumber: string,
  floor: number,
  roomType: string
) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"NITH Hostel System" <${FROM}>`,
    to: email,
    subject: 'Room allotted — NITH Hostel Allotment',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">NIT Hamirpur — Hostel Allotment System</h2>
        <p>Hi ${name},</p>
        <p>Congratulations! Your room has been allotted.</p>
        <div style="background: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Hostel:</strong> ${hostelName}</p>
          <p style="margin: 4px 0;"><strong>Room:</strong> ${roomNumber}</p>
          <p style="margin: 4px 0;"><strong>Floor:</strong> ${floor}</p>
          <p style="margin: 4px 0;"><strong>Type:</strong> ${roomType}</p>
        </div>
        <p>Log in to the portal to view full details and your roommates.</p>
      </div>
    `,
  });
};

export const sendUnresolvedAllotmentEmail = async (email: string, name: string) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"NITH Hostel System" <${FROM}>`,
    to: email,
    subject: 'Room preferences could not be fulfilled — NITH Hostel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">NIT Hamirpur — Hostel Allotment System</h2>
        <p>Hi ${name},</p>
        <p>Unfortunately, all three of your room preferences were taken by students with higher CGPA.</p>
        <p>The hostel admin will contact you shortly to assign a room manually from available options.</p>
        <p>We apologise for the inconvenience.</p>
      </div>
    `,
  });
};
