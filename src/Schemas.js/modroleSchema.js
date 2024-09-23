const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
    guildID: { type: String, required: true, unique: true },
    modRole: { type: String, default: null },
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);
