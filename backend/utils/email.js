import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import nodemailer from "nodemailer";
import User from "../models/UserSchema.js";

console.log(
  "EMAIL DEBUG =>",
  process.env.EMAIL_USER,
  process.env.EMAIL_PASS ? "PASS_OK" : "NO_PASS"
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// HARD LIMIT EMAIL (100% reached or crossed)
export const sendLimitEmailToUser = async (userId, category, spent, limit) => {
  const user = await User.findById(userId).lean();
  if (!user || !user.email) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Budget limit crossed for ${category}`,
    text: `Hi ${user.name || "user"},

You have crossed the monthly limit for ${category}.

Limit: ₹${limit}
This month spent: ₹${spent}

Try to control further spending in this category to stay inside your plan.

Expense Management System`,
  };

  await transporter.sendMail(mailOptions);
};

// WARNING EMAIL (around 80% of limit)
export const sendWarningEmailToUser = async (
  userId,
  category,
  spent,
  limit
) => {
  const user = await User.findById(userId).lean();
  if (!user || !user.email) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Budget warning for ${category}`,
    text: `Hi ${user.name || "user"},

You are close to reaching your monthly limit for ${category}.

Limit: ₹${limit}
This month spent so far: ₹${spent}

Please watch this category to avoid crossing your planned budget.

Expense Management System`,
  };

  await transporter.sendMail(mailOptions);
};
