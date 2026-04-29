const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    // 1. Broad Category (Filter karne ke liye easy rahega)
    category: {
        type: String,
        required: true,
        enum: ['Safety', 'Infrastructure', 'Sanitation', 'Utility'], 
    },

    // 2. Specific Incident Type (Ispe priority depend karegi)
    incidentType: {
        type: String,
        required: true,
        enum: [
            // Safety (Police / Women Safety Unit)
            'Women Safety SOS', 'Harassment', 'Theft/Burglary', 'Assault', 
            // Infrastructure (NMC Engineering)
            'Potholes', 'Broken Footpath', 'Public Property Damage',
            // Sanitation (NMC Health/Sanitation)
            'Garbage Overflow', 'Clogged Drain', 'Dead Animal Disposal',
            // Utility (NMC Electrical/Water)
            'Streetlight Not Working', 'Water Leakage', 'No Water Supply'
        ]
    },

    // 3. Department Allocation (Auto-routing ke liye)
    department: {
        type: String,
        required: true,
        enum: ['Police', 'NMC_Engineering', 'NMC_Sanitation', 'NMC_Electrical', 'NMC_Water', 'Women_Safety_Unit']
    },

    // 4. Priority System (As per your PS: Priority-based resolution)
    priority: {
        type: String,
        required: true,
        enum: ['Critical', 'High', 'Medium', 'Low'],
        default: 'Medium'
    },

    severity: { // User input on how they feel about the issue
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },

    locationAddress: {
        type: String,
        required: true,
        trim: true
    },

    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    // Proof of Issue & Proof of Resolution
    evidenceUrls: {
        type: [String], // Photo clicked by Citizen
        default: []
    },
    // resolutionProofUrls: {
    //     type: [String], // Photo uploaded by Official after fixing
    //     default: []
    // },

    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    assignedTo: { // Targeted Official
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    status: {
        type: String,
        enum: ['new', 'acknowledged', 'in_progress', 'resolved', 'rejected'],
        default: 'new'
    },

    // Accountability: Track kab kya hua
    resolvedAt: { type: Date },
    adminComments: { type: String }

}, { timestamps: true });

reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);