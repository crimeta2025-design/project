const analyticsSchema = new Schema({
    wardName: { type: String, required: true, unique: true },
    totalReports: { type: Number, default: 0 },
    resolvedReports: { type: Number, default: 0 },
    pendingReports: { type: Number, default: 0 },
    averageResolutionTime: { type: Number }, // In hours/days
    efficiencyScore: { type: Number, default: 0 } // (Resolved / Total) * 100
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);