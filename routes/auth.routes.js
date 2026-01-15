import express from "express";
import pool from "../config/db.js";
import redis from "../config/redis.js";
import jwt from "jsonwebtoken";
import twilioClient from "../config/twilio.js";
import transporter from "../config/nodemailer.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/request-otp", async (req, res) => {
  const { email, phone } = req.body;
  
  if (!email && !phone) {
    return res
    .status(400)
    .json({ message: "Please enter valid email or phone number." });
  }
  
  const identifier = email || phone;
  const key = email ? `otp:email:${email}` : `otp:phone:${phone}`;
  const limitKey = email
  ? `otp_limit:email:${email}`
  : `otp_limit:phone:${phone}`;
  const attempts = await redis.get(limitKey);

  if(attempts && Number(attempts) >= 5){
    return res.status(429).json({
      message: "Too many OTP requests. Try again later."
    });
  }

  await redis.multi()
    .incr(limitKey)
    .expire(limitKey, 600)
    .exec();

  const otp = generateOTP();

  await redis.set(
    key,
    JSON.stringify({ otp }),
    "EX",
    300 // OTP valid for 5 minutes.
  );

  if (phone) {
    try {
      await twilioClient.messages.create({
        body: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } catch (err) {
      console.log("Twilio error: ", err);
    }
  } else {
    transporter.verify((err, success) => {
      if (err) console.error(err);
      else console.log("Email auth working ✅");
    });
    await transporter.sendMail({
      from: "Aman yadav",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`,
    });
  }
  console.log(`OTP: ${otp}. Will expire in 5 minutes.`);

  res.json({
    message: `OTP sent succesfuly.`,
  });
});

router.post("/verify-otp", async (req, res) => {
  const { email, phone, otp } = req.body;

  if (!otp || (!email && !phone)) {
    return res
      .status(400)
      .json({ message: "Please enter OTP." });
  }

  const identifier = email || phone;
  const key = email ? `otp:email:${email}` : `otp:phone:${phone}`;

  const stored = await redis.get(key);

  if (!stored) {
    return res.status(400).json({ message: "OTP has expired or is invalid." });
  }

  const { otp: storedOtp } = JSON.parse(stored);

  if (storedOtp !== otp) {
    return res.status(401).json({ message: "Invalid OTP, please try again." });
  }

  await redis.del(key);

  const result = await pool.query(
    email
      ? "SELECT * FROM users WHERE email = $1"
      : "SELECT * FROM users WHERE phone = $1",
    [identifier]
  );

  let user = result.rows[0];

  if (!user) {
    const insert = await pool.query(
      email
        ? "INSERT INTO users (email) VALUES ($1) RETURNING *"
        : "INSERT INTO users (phone) VALUES ($1) RETURNING *",
      [identifier]
    );
    user = insert.rows[0];
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "OTP verified successfully.",
    token,
    user,
  });
});


router.get("/user", requireAuth, async (req, res) => {
  const { userId } = req.user;

  const result = await pool.query("SELECT * from users WHERE id = $1", [userId]);
  
  res.json(result.rows[0]);
})


export default router;