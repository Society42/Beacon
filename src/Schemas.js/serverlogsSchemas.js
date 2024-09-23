const mongoose = require('mongoose');

const logSettingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannelId: { type: String },
    channelLogs: { type: Boolean, default: false },
    messageLogs: { type: Boolean, default: false },
    userLogs: { type: Boolean, default: false },
    roleLogs: { type: Boolean, default: false },
});

module.exports = mongoose.model('LogSettings', logSettingsSchema);
