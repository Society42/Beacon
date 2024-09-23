const mongoose = require('mongoose');

const autoModSettingsSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannelId: { type: String },
    ghostPing: { type: Boolean, default: false },
    spam: { type: Boolean, default: false },
    wordFilter: { type: Boolean, default: false },
    links: { type: Boolean, default: false },
    filters: {
      type: [String],
      default: [
          "profanity",
          "curse",
          "vulgarity",
          "hate",
          "idiot",
          "jerk",
          "stupid",
          "dumb",
          "fool",
          "moron",
          "loser",
          "scam",
          "bitch",
          "asshole",
          "shit",
          "fuck",
          "cunt",
          "whore",
          "nigger",
          "dick",
          "bastard",
          "pussy",
          "cocksucker",
          "cuntface",
          "motherfucker",
          "faggot"
      ]
  }
  });

module.exports = mongoose.model('AutoModSettings', autoModSettingsSchema);
