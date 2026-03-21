const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // [cite: 29]
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// --- NODEMAILER TRANSPORTER SETUP ---
// Isme hum Gmail ka use kar rahe hain taaki tokens ki limit na ho
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'crimeta2025@gmail.com', 
        pass: process.env.GMAIL_APP_PASSWORD // Aapka 16-digit App Password
    }
});

// --- 1. CITIZEN REGISTRATION (With OTP) ---
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

        const mailOptions = {
            from: '"Crimeta Team" <crimeta2025@gmail.com>',
            to: email,
            subject: 'Verify Your Account | Crimeta',
            html: `
                <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #007bff;">Hello ${name},</h2>
                    <p>Welcome to <b>Crimeta</b>. Use the following OTP to verify your account:</p>
                    <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otp}</h1>
                    <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
                </div>`
        };

        console.log(`Sending OTP ${otp} to ${email}`); // Testing 
        await transporter.sendMail(mailOptions);

        res.status(201).json({ msg: 'Registration successful! Check your email for OTP.', email: email });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Failed to send email.", details: error.message });
    }
});

// --- 2. DEPARTMENT REGISTRATION ---
router.post('/register/department', async (req, res) => {
    try {
        const { name, email, password, contact_number, address, city, pincode, badge_number, latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ msg: 'Location coordinates are required.' });
        }
        if (await User.findOne({ email })) {
            return res.status(400).json({ msg: 'Department already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, salt);

        const user = new User({
            name, email, password: hashedPassword, contact_number,
            role: 'police', status: 'pending_verification',
            address, city, pincode, badge_number,
            location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            otp: hashedOtp,
            otpExpiry: Date.now() + 10 * 60 * 1000
        });
        await user.save();

        const mailOptions = {
            from: '"Crimeta Police Portal" <crimeta2025@gmail.com>',
            to: email,
            subject: 'Police Department Verification | Crimeta',
            html: `<p>Hello Officer <b>${name}</b>,</p><p>Your verification OTP is: <b style="font-size: 20px;">${otp}</b></p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({ msg: 'Registration request sent! Check email.', email: user.email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- VERIFY OTP ROUTE (Koi badlaav nahi) ---
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, receivedOtp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: 'User not found.' });
        if (!user.otp || user.otpExpiry < Date.now()) return res.status(400).json({ msg: 'OTP expired.' });

        const isMatch = await bcrypt.compare(receivedOtp, user.otp);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid OTP.' });

        user.status = user.role === 'citizen' ? 'approved' : 'pending_approval';
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({ msg: 'Email verified!', status: user.status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- LOGIN ROUTE (Koi badlaav nahi) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (user.status !== 'approved' && user.status !== 'pending_approval') {
            return res.status(403).json({ msg: `Account status: ${user.status}` });
        }

        const payload = { user: { id: user.id, role: user.role, name: user.name } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }); // 
        res.status(200).json({ message: "Login Successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 5. FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(200).json({ msg: 'If registered, you will receive a link.' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetUrl = `https://crimeta.onrender.com/reset-password/${resetToken}`;

        const mailOptions = {
            from: '"Crimeta Team" <crimeta2025@gmail.com>',
            to: email,
            subject: 'Password Reset Request | Crimeta',
            html: `<h3>Reset Your Password</h3><p>Click <a href="${resetUrl}">here</a> to reset your password. Valid for 15 mins.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ msg: 'Reset link sent to email.' });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// --- 6. RESET PASSWORD ---
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ msg: 'Token invalid or expired.' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ msg: 'Password reset successful!' });
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;
