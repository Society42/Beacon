const mongoose = require('mongoose');

const LogChannelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    logChannelId: {
        type: String,
        default: null
    }
});

module.exports = mongoose.models.LogChannel || mongoose.model('LogChannel', LogChannelSchema);
