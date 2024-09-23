const mongoose = require('mongoose');

const autoModSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  ghostPing: { type: Boolean, default: false },
  spam: { type: Boolean, default: false },
  links: { type: Boolean, default: false },
  wordFilter: { type: Boolean, default: false },
  filters: { type: [String], default: ["fuck", "bitch", "nigga"] }
});

const AutoModSettings = mongoose.models.AutoModSettings || mongoose.model('AutoModSettings', autoModSchema);

module.exports = AutoModSettings;
