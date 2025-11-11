const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

// Set the API key for SendGrid
// This runs once when the file is loaded
sgMail.setApiKey(process.env.EMAIL); 

// --- 1. Normal Citizen Registration (With OTP based) ---
router.post('/register/user', async (req, res) => {

    try {
        const { name, email, password, contact_number } = req.body;
        if (!name || !email || !password || !contact_number) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }

        if (await User.findOne({ email })) {
            return res.status(400).json({ msg: 'User with this email already exists.' });
        }

        // Hash password and create OTP
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, salt);

        const user = new User({
            name, email, password: hashedPassword, contact_number,
            role: 'citizen',
            status: 'pending_verification',
            otp: hashedOtp,
            otpExpiry: Date.now() + 10 * 60 * 1000 // 10 minutes
        });
        
        console.log("Step 1: User object created.");
        await user.save();
        console.log("Step 2: User saved to database (MongoDB).");

        // Create the email message
        const msg = {
            to: email,
            from: verifiedSender, // IMPORTANT: Must be your verified sender
            subject: 'Verify Your Account | Crimeta',
            html: `... (Your HTML template) ... Your OTP is: ${otp} ...` // Full template
        };
        
        console.log(`Step 3: Sending email (to: ${email})...`);
        
        // --- THIS IS THE LINE THAT IS LIKELY HANGING ---
        await sgMail.send(msg); 

        console.log("✅ Step 4: Email sent successfully (Accepted by SendGrid).");

        res.status(201).json({ msg: 'Registration successful! Please check your email for OTP.', email: email });

    } catch (error) {
        // This block will run if sgMail.send() fails (rejects the promise)
        console.error("❌ ERROR (CATCH BLOCK): Failed to send email!");
        console.error(error); // Print the full error object

        if (error.response) {
            // If it's a specific SendGrid error (like '401 Unauthorized')
            console.error("--- SendGrid Error Details ---");
            console.error(error.response.body);
            console.error("------------------------------");
        }
        
        res.status(500).json({ error: "Failed to send email.", details: error.message });
    }
});

// 2. Department Registration Request 
router.post('/register/department', async (req, res) => {
    try {
        const {
            name, email, password, contact_number,
            address, city, pincode, badge_number,
            latitude, longitude
        } = req.body;

        // ...Validation...
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
            name, email, password: hashedPassword, contact_number,
            role: 'police', status: 'pending_verification',
            address, city, pincode, badge_number,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            otp: hashedOtp,
            otpExpiry: Date.now() + 10 * 60 * 1000
        });
        await user.save();

        // --- SENDGRID (Nodemailer ko replace kiya) ---
        const msg = {
            to: email, // User ka email
            from: 'crimeta2025@gmail.com', // Aapka verified SendGrid sender
            subject: 'Verify Your Account | Crimeta',
            html: `
              <div style="font-family: Arial, sans-serif; ...">
                Hello <b>${name}</b>,
                Your OTP is: ${otp}
                </div>
            `
        };

        await sgMail.send(msg); // Email bhejein
        // --- END SENDGRID ---

        res.status(201).json({ msg: 'Registration request sent! Please check your email for OTP.', email: user.email });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ msg: error.message });
        }
        console.error("Department Registration Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- VERIFY OTP ROUTE (Koi badlaav nahi) ---
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


// --- LOGIN ROUTE (Koi badlaav nahi) ---
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
            // Security ke liye, hum user ko batate nahi ki email exist nahi karta
            return res.status(200).json({ msg: 'Agar aapka email registered hai, to aapko ek reset link milega.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minute
        await user.save();

        const resetUrl = `https://crimeta.onrender.com/reset-password/${resetToken}`; // Yeh aapke frontend URL par depend karega

        // --- SENDGRID (Nodemailer ko replace kiya) ---
        const msg = {
            to: email,
            from: 'crimeta2025@gmail.com', // Aapka verified sender
            subject: 'Password Reset Request | Crimeta',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #ffffff;">
        
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Police_badge_icon.svg/1024px-Police_badge_icon.svg.png" alt="Crimeta Logo" width="70" style="margin-bottom: 10px;" />
                  <h2 style="color: #333; margin: 0;">Crimeta</h2>
                </div>

                <p style="font-size: 16px; color: #333;">Hello <b>${user.name}</b>,</p>
        
                <p style="font-size: 15px; color: #555; line-height: 1.6;">
                  Aapne <b>Crimeta</b> par password reset ke liye request kiya hai.<br />
                  Naya password banane ke liye neeche diye gaye link par click karein:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: #ffffff; font-size: 18px; font-weight: bold; border-radius: 6px; text-decoration: none;">
                    Reset Password
                  </a>
                </div>

                <p style="font-size: 14px; color: #777; line-height: 1.5;">
                  Yeh link 15 minutes mein expire ho jaayega. Agar aapne request nahi kiya, toh is email ko ignore karein.
                </p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 13px; color: #999; text-align: center;">
                  Regards,<br />
                  <b>Team Crimeta</b>
                </p>
              </div>
            `
        };

        await sgMail.send(msg); // Email bhejein
        // --- END SENDGRID ---

        res.status(200).json({ msg: 'Agar aapka email registered hai, to aapko ek reset link milega.' });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// --- RESET PASSWORD ROUTE (Koi badlaav nahi) ---
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