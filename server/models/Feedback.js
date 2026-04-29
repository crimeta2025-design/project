const feedbackSchema = new Schema({
    reportId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Report', 
        required: true 
    },
    citizenId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    isSatisfied: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);