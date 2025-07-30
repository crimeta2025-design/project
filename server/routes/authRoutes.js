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
        user: 'sj0855530@gmail.com', // Company Gmail
        pass: 'tsod cgsl gqvq pjwm' // App Password
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
            from: 'sj0855530@gmail.com', to: email,
            subject: 'Verify Your Account | Crime Reporter',
            html: `<h3>Your OTP is: ${otp}</h3>`
        });

        res.status(201).json({ msg: 'Registration successful! Please check your email for OTP.', email: email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Department Registration Request 
router.post('/register/department', async (req, res) => {
    try {
        const { name, email, password, contact_number, address, city, pincode, location } = req.body;
        

        if (await User.findOne({ email })) {
            return res.status(400).json({ msg: 'Department with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, salt);

        const user = new User({
            name, email, password: hashedPassword, contact_number,
            role: 'police',
            status: 'pending_verification', 
            address, city, pincode, location,
            otp: hashedOtp,
            otpExpiry: Date.now() + 10 * 60 * 1000
        });
        await user.save();

        await transporter.sendMail({
            from: 'sj0855530@gmail.com', to: email,
            subject: 'Verify Your Department Account | Crime Reporter',
            html: `<h3>Your OTP is: ${otp}</h3>`
        });

        res.status(201).json({ msg: 'Registration request sent! Please check your email for OTP.', email: email });
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).json({ msg: error.message });
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
        res.status(200).json({message: "Login Successful", token });

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
            from: 'sj0855530@gmail.com',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <p>Aapne password reset ke liye request kiya hai.</p>
                <p>Is link par click karke apna password reset karein:</p>
                <a href="${resetUrl}" target="_blank">Reset Password</a>
                <p>Yeh link 15 minute ke liye valid hai.</p>
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
