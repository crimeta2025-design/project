const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    contact_number: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['citizen', 'police', 'admin'],
        required: true
    },

    // OTP
    status: {
        type: String,
        enum: ['pending_verification', 'pending_approval', 'approved', 'rejected'],
        default: 'pending_verification'
    },
    otp: { type: String },
    otpExpiry: { type: Date },


    
    // --- FORGOT PASSWORD FIELDS ---
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },

    
    // --- POLICE-SPECIFIC FIELDS ---

    address: {
        type: String,
        trim: true,
        required: function() { return this.role === 'police'; }
    },
    city: {
        type: String,
        trim: true,
        required: function() { return this.role === 'police'; }
    },
    pincode: {
        type: String,
        trim: true,
        required: function() { return this.role === 'police'; }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: function() { return this.role === 'police'; }
        },
        coordinates: {
            type: [Number],
            required: function() { return this.role === 'police'; }
        }
    }
}, {
    timestamps: true
});

// Geospatial Index
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
