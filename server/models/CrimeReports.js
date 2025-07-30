const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const crimeReports = new Schema({
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'in_progress', 'resolved', 'rejected'],
        default: 'new'
    }
}, { timestamps: true });

crimeReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('CrimeReport', crimeReports);

