const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

// --- 1. CITIZEN REGISTRATION (Simple - No OTP) ---
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

    const user = new User({
      name,
      email,
      password: hashedPassword,
      contact_number,
      role: 'citizen',
      status: 'approved' // OTP nahi hai, toh seedha approve kar rahe hain
    });

    await user.save();
    console.log("✅ User registered and approved:", email);

    res.status(201).json({
      msg: 'Registration successful! You can now login.',
      email: email
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server Error", details: error.message });
  }
});

// --- 2. DEPARTMENT REGISTRATION (Simple - No OTP) ---
router.post('/register/department', async (req, res) => {
  try {
    // 1. req.body se sara data extract karo
    const { 
      name, email, password, contact_number, 
      address, city, pincode, role, 
      department, ward_assigned, designation, location 
    } = req.body;

    // 2. Official ke liye Location validation
    // Citizen ke liye location optional ho sakti hai, par Official/NMC ke liye required hai
    if (role === 'official') {
      if (!location || !location.coordinates || location.coordinates.length !== 2) {
        return res.status(400).json({ msg: 'Official location coordinates (longitude & latitude) are required.' });
      }
    }

    // 3. Email Check (Pehle se registered toh nahi hai?)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User or Department already exists with this email.' });
    }

    // 4. Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. AUTO-APPROVAL LOGIC
    // Agar role 'citizen' hai toh direct 'approved', agar 'official' hai toh 'pending_approval'
    let finalStatus = 'approved';
    if (role === 'official') {
      finalStatus = 'pending_approval';
    }

    // 6. New User Instance creation
    const userFields = {
      name,
      email,
      password: hashedPassword,
      contact_number,
      role: role || 'citizen', // Default citizen agar kuch na bheja ho
      status: finalStatus,
      address,
      city: city || 'Nagpur',
      pincode,
      department,
      ward_assigned,
      designation
    };

    // Location sirf tabhi add karo jab data ho (Official ke liye)
    if (location && location.coordinates) {
      userFields.location = {
        type: 'Point',
        coordinates: [
          parseFloat(location.coordinates[0]), 
          parseFloat(location.coordinates[1])
        ]
      };
    }

    const user = new User(userFields);
    await user.save();

    console.log(`✅ ${role} registered: ${email} | Status: ${finalStatus}`);

    // 7. Custom Response Message
    const successMsg = (role === 'official') 
      ? 'Department registration successful! Awaiting admin approval.' 
      : 'User registered successfully!';

    res.status(201).json({ 
      msg: successMsg, 
      email: user.email,
      status: user.status 
    });

  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// --- 3. LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Lean Query: .lean() use karne se Mongoose objects fast load hote hain (Read-only speed)
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Status Check: Agar official pending hai toh use login mat karne do
    if (user.role === 'official' && user.status === 'pending_approval') {
      return res.status(403).json({ msg: 'Account awaiting admin approval. Please wait.' });
    }

    // 3. Password Verification: Ye CPU intensive hota hai, ensures everything else is ready first
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 4. Token Payload: Role aur Department dono bhejo taaki frontend pe decide ho sake kya dikhana hai
    const payload = { 
      user: { 
        id: user._id, 
        role: user.role, 
        name: user.name,
        department: user.department || null 
      } 
    };

    // 5. JWT Sign: Secret key check kar lena .env mein hai na
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10h' });

    console.log(`🚀 Login Success: ${user.email} (${user.role})`);

    res.status(200).json({ 
      message: "Login Successful", 
      token,
      user: {
        name: user.name,
        role: user.role,
        department: user.department,
        status: user.status
      }
    });

  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;