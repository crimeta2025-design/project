const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require("nodemailer");
const crypto = require('crypto');


// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'crimeta2025@gmail.com', // Company Gmail
        pass: 'ehsq ruec trpy szpl' // App Password    
    }
});



// 1. Normal Citizen Registration (With OTP based)
router.post('/register/user', async (req, res) => {
    try {
        const { name, email, password, contact_number } = req.body;
        if (!name || !email || !password || !contact_number) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }

        if (await User.findOne({ email })) {
            return res.status(400).json({ msg: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, salt);

        const user = new User({
            name, email, password: hashedPassword, contact_number,
            role: 'citizen',
            status: 'pending_verification',
            otp: hashedOtp,
            otpExpiry: Date.now() + 10 * 60 * 1000
        });
        await user.save();

        await transporter.sendMail({
            from: 'Crimeta', to: email,
            subject: 'Verify Your Account | Crimeta',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
      
                <!-- Logo -->
                <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Police_badge_icon.svg/1024px-Police_badge_icon.svg.png" alt="Crimeta Logo" width="70" style="margin-bottom: 10px;" />
                <h2 style="color: #333; margin: 0;">Crimeta</h2>
            </div>

            <!-- Greeting -->
                <p style="font-size: 16px; color: #333;">Hello <b>${name}</b>,</p>
      
            <!-- Message -->
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Thank you for signing up with <b>Crimeta - Crime Reporter</b>.<br />
                To complete your registration, please use the One-Time Password (OTP) below:
            </p>

            <!-- OTP Box -->
            <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; padding: 12px 25px; background-color: #87CEEB; color: #000; font-size: 20px; font-weight: bold; border-radius: 6px; letter-spacing: 2px;">
                ${otp}
                </span>
            </div>

            <!-- Extra Note -->
            <p style="font-size: 14px; color: #777; line-height: 1.5;">
                This OTP will expire in 10 minutes. Please do not share it with anyone for security reasons.
            </p>

            <!-- Footer -->
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 13px; color: #999; text-align: center;">
                Regards,<br />
                <b>Team Crimeta</b><br />
                Crime Reporter Platform
                </p>
            </div>
                    `
        });


        res.status(201).json({ msg: 'Registration successful! Please check your email for OTP.', email: email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Department Registration Request 
router.post('/register/department', async (req, res) => {
    try {
        // 1. Frontend se latitude aur longitude ko bhi nikalein
        const {
            name, email, password, contact_number,
            address, city, pincode, badge_number,
            latitude, longitude
        } = req.body;

        // Validation
        if (!latitude || !longitude) {
            return res.status(400).json({ msg: 'Location coordinates are required for police registration.' });
        }
        if (await User.findOne({ email })) {
            return res.status(400).json({ msg: 'Department with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            contact_number,
            role: 'police',
            status: 'pending_verification',
            address,
            city,
            pincode,
            badge_number,

            // 2. Yahan par Mongoose ke liye zaroori 'location' object banayein
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },

            otp: hashedOtp,
            otpExpiry: Date.now() + 10 * 60 * 1000
        });
        await user.save();

        await transporter.sendMail({
            from: 'Crimeta', to: email,
            subject: 'Verify Your Account | Crimeta',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
      
                <!-- Logo -->
                <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Police_badge_icon.svg/1024px-Police_badge_icon.svg.png" alt="Crimeta Logo" width="70" style="margin-bottom: 10px;" />
                <h2 style="color: #333; margin: 0;">Crimeta</h2>
            </div>

            <!-- Greeting -->
                <p style="font-size: 16px; color: #333;">Hello <b>${name}</b>,</p>
      
            <!-- Message -->
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Thank you for signing up with <b>Crimeta</b>.<br />
                To complete your registration, please use the One-Time Password (OTP) below:
            </p>

            <!-- OTP Box -->
            <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; padding: 12px 25px; background-color: #87CEEB; color: #000; font-size: 20px; font-weight: bold; border-radius: 6px; letter-spacing: 2px;">
                ${otp}
                </span>
            </div>

            <!-- Extra Note -->
            <p style="font-size: 14px; color: #777; line-height: 1.5;">
                This OTP will expire in 10 minutes. Please do not share it with anyone for security reasons.
            </p>

            <!-- Footer -->
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 13px; color: #999; text-align: center;">
                Regards,<br />
                <b>Team Crimeta</b><br />
                Crime Reporter Platform
                </p>
            </div>
                    `
        });

        res.status(201).json({ msg: 'Registration request sent! Please check your email for OTP.', email: user.email });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ msg: error.message });
        }
        console.error("Department Registration Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- NEW ROUTE FOR VERIFICATION ---
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, receivedOtp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: 'User not found.' });
        if (user.status !== 'pending_verification') return res.status(400).json({ msg: 'This account is not awaiting verification.' });
        if (!user.otp || user.otpExpiry < Date.now()) return res.status(400).json({ msg: 'OTP has expired.' });

        if (!await bcrypt.compare(receivedOtp, user.otp)) {
            return res.status(400).json({ msg: 'Invalid OTP.' });
        }


        if (user.role === 'citizen') {
            user.status = 'approved';
        } else if (user.role === 'police') {
            user.status = 'pending_approval';
        }

        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ msg: `Email verified successfully. Your account status is now: ${user.status}` });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- LOGIN ROUTE 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (user.status !== 'approved') {
            return res.status(403).json({ msg: `Your account is not approved. Current status: ${user.status}` });
        }



        const payload = { user: { id: user.id, role: user.role, name: user.name, } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.status(200).json({ message: "Login Successful", token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// =======================================================
// FORGOT PASSWORD ROUTES
// =======================================================

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ msg: 'Sent an mail to your email.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
        await user.save();


        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: 'Crimeta', to: email,
            subject: 'Password Reset Request | Crimeta',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
      
                <!-- Logo -->
                <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Police_badge_icon.svg/1024px-Police_badge_icon.svg.png" alt="Crimeta Logo" width="70" style="margin-bottom: 10px;" />
                <h2 style="color: #333; margin: 0;">Crimeta</h2>
            </div>

            <!-- Greeting -->
                <p style="font-size: 16px; color: #333;">Hello <b>${name}</b>,</p>
      
            <!-- Message -->
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                 <b>Crimeta - Crime Reporter</b>.<br />
                To forget your otp, please use the One-Time Password (OTP) below:
            </p>

            <!-- OTP Box -->
            <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; padding: 12px 25px; background-color: #87CEEB; color: #000; font-size: 20px; font-weight: bold; border-radius: 6px; letter-spacing: 2px;">
                ${otp}
                </span>
            </div>

            <!-- Extra Note -->
            <p style="font-size: 14px; color: #777; line-height: 1.5;">
                This OTP will expire in 10 minutes. Please do not share it with anyone for security reasons.
            </p>

            <!-- Footer -->
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 13px; color: #999; text-align: center;">
                Regards,<br />
                <b>Team Crimeta</b><br />
                Crime Reporter Platform
                </p>
            </div>
                    `
        });

        res.status(200).json({ msg: 'Agar aapka email registered hai, to aapko ek reset link milega.' });

    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});


router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const resetToken = req.params.token;

        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Token is invalid or has expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.status(200).json({
            msg: 'Password has been reset successfully!',
            token: token
        });

    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
