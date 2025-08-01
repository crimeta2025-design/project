const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crimeReports = new Schema({
    incidentType: {
        type: String,
        required: true,
        enum: [
            'Theft/Burglary', 'Assault', 'Vandalism', 'Drug Activity', 'Fraud',
            'Domestic Violence', 'Harassment', 'Traffic Violation', 
            'Suspicious Activity', 'Other'
        ]
    },
    severity: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High']
    },
    locationAddress: {
        type: String,
        required: true,
        trim: true
    },
    // User actual GPS location
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
    incidentDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    evidenceUrls: {
        type: [String],
        default: []
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['new', 'in_progress', 'resolved', 'rejected'],
        default: 'new'
    }
}, { timestamps: true });

crimeReports.index({ location: '2dsphere' });

module.exports = mongoose.model('CrimeReport', crimeReports);

