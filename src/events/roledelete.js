const { Events, EmbedBuilder } = require('discord.js');
const LogSettingsSchema = require('../Schemas.js/serverlogsSchemas');

module.exports = {
    name: Events.GuildRoleDelete,
    async execute(role) {
        if (!role.guild) return;

        const guildId = role.guild.id;

        try {
            const logSettings = await LogSettingsSchema.findOne({ guildId });

            if (!logSettings || !logSettings.roleLogs) return;

            const logChannelId = logSettings.logChannelId;

            if (!logChannelId) return;

            const logChannel = role.guild.channels.cache.get(logChannelId);
            if (!logChannel) {
                console.error(`Log channel with ID ${logChannelId} not found in guild ${guildId}`);
                return;
            }

            const fetchedLogs = await role.guild.fetchAuditLogs({
                limit: 1,
                type: 32, 
            });

            const auditEntry = fetchedLogs.entries.first();
            const deletedBy = auditEntry ? auditEntry.executor : 'Unknown';

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Role Deleted')
                .setDescription(`A role has been deleted`)
                .addFields(
                    { name: 'Role Name', value: role.name, inline: true },
                    { name: 'Role ID', value: role.id, inline: true },
                    { name: 'Deleted By', value: `<@${deletedBy.id}>`, inline: true }
                )
                .setFooter({ text: "Beacon | Role Deletion Logger" })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error handling roleDelete event:', error);
        }
    }
};
