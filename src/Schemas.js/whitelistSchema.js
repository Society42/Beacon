const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    whitelist: {
        users: { type: [String], default: [] },
        roles: { type: [String], default: [] },
        channels: { type: [String], default: [] },
    },
});

module.exports = mongoose.model('Whitelist', whitelistSchema);
