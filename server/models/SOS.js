const sosContactSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    contacts: [{
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relation: { type: String }
    }]
});

module.exports = mongoose.model('SOS', sosContactSchema);