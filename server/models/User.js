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
        enum: ['citizen', 'official', 'admin'],
        required: true,
        default: 'citizen'
    },

    // --- STATUS & VERIFICATION ---
    // --- STATUS & VERIFICATION ---
status: {
    type: String,
    enum: ['approved', 'pending_approval'], 
    default: 'approved' // Citizen ke liye default approved
},
    otp: { type: String },
    otpExpiry: { type: Date },

    // --- OFFICIAL-SPECIFIC FIELDS (NMC, Police, etc.) ---
    // Agar user 'official' hai, tabhi ye fields required hongi
    department: {
        type: String,
        enum: [
            'Police', 
            'NMC_Engineering', 
            'NMC_Sanitation', 
            'NMC_Electrical', 
            'NMC_Water', 
            'Women_Safety_Unit'
        ],
        required: function() { return this.role === 'official'; }
    },
    
    designation: { 
        type: String, 
        trim: true,
        placeholder: "e.g., Junior Engineer, Ward Officer, Sub-Inspector"
    },

    ward_assigned: {
        type: String, // Kis area ka officer hai
        required: function() { return this.role === 'official'; }
    },

    // Address & Location
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true,
        default: 'Nagpur' // NMC project hai toh default Nagpur rakh sakte ho
    },
    pincode: {
        type: String,
        trim: true
    },

    // Geo-location for mapping the official's office or jurisdiction
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: function() { return this.role === 'official'; }
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: function() { return this.role === 'official'; }
        }
    }
}, {
    timestamps: true
});

// Indexing for faster location-based queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);