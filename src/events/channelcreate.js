const { Events, EmbedBuilder, GatewayIntentBits, Client } = require('discord.js');
const LogSettingsSchema = require('../Schemas.js/serverlogsSchemas');

const CHANNEL_TYPE_MAP = {
    GUILD_TEXT: { name: 'Text Channel', value: 0 },
    GUILD_VOICE: { name: 'Voice Channel', value: 2 },
    GUILD_CATEGORY: { name: 'Category Channel', value: 4 },
    GUILD_NEWS: { name: 'Announcement Channel', value: 5 },
    GUILD_STAGE_VOICE: { name: 'Stage Voice Channel', value: 13 },
    GUILD_PUBLIC_THREAD: { name: 'Public Thread', value: 11 },
    GUILD_PRIVATE_THREAD: { name: 'Private Thread', value: 12 },
    GUILD_NEWS_THREAD: { name: 'News Thread', value: 10 },
    GUILD_STORE: { name: 'Store Channel', value: 5 },
    GUILD_FORUM: { name: 'Forum Channel', value: 15 },
    GUILD_MEDIA: { name: 'Media Channel', value: 16 },
    GUILD_DIRECTORY: { name: 'Directory Channel', value: 14 },
    UNKNOWN: { name: 'Unknown Type', value: null }
};

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        if (!channel.guild) return;

        const guildId = channel.guild.id;

        try {
            const logSettings = await LogSettingsSchema.findOne({ guildId });

            if (!logSettings || !logSettings.channelLogs) return;

            const logChannelId = logSettings.logChannelId;

            if (!logChannelId) return;

            const logChannel = channel.guild.channels.cache.get(logChannelId);
            if (!logChannel) {
                console.error(`Log channel with ID ${logChannelId} not found in guild ${guildId}`);
                return;
            }

            // Fetch the audit logs to find who created the channel
            const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: 0, // CHANNEL_CREATE
            });

            const createdBy = fetchedLogs.entries.first()?.executor || 'Unknown';

            // Determine channel type
            const channelTypeInfo = CHANNEL_TYPE_MAP[channel.type] || CHANNEL_TYPE_MAP.UNKNOWN;
            const channelType = channelTypeInfo.name;

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Channel Created')
                .setDescription(`A new channel has been created`)
                .addFields(
                    { name: 'Channel Name', value: channel.name, inline: true },
                    { name: 'Channel ID', value: channel.id, inline: true },
                    { name: 'Channel Type', value: channelType, inline: true },
                    { name: 'Created By', value: `<@${createdBy.id}>`, inline: true }
                )
                .setFooter({ text: "Beacon | Channel Creation Logger" })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error handling channelCreate event:', error);
        }
    }
};
