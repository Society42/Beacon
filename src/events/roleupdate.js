const { Events, EmbedBuilder } = require('discord.js');
const LogSettingsSchema = require('../Schemas.js/serverlogsSchemas');

module.exports = {
    name: Events.GuildRoleUpdate,
    async execute(oldRole, newRole) {
        if (!newRole.guild) return;

        const guildId = newRole.guild.id;

        try {
            const logSettings = await LogSettingsSchema.findOne({ guildId });

            if (!logSettings || !logSettings.roleLogs) return;

            const logChannelId = logSettings.logChannelId;

            if (!logChannelId) return;

            const logChannel = newRole.guild.channels.cache.get(logChannelId);
            if (!logChannel) {
                console.error(`Log channel with ID ${logChannelId} not found in guild ${guildId}`);
                return;
            }

            // Fetch the audit logs to find who updated the role
            const fetchedLogs = await newRole.guild.fetchAuditLogs({
                limit: 1,
                type: 30, // Role update action type
            });

            const auditEntry = fetchedLogs.entries.first();
            if (!auditEntry) {
                console.warn('No audit entry found for the role update.');
                return;
            }

            if (auditEntry.target.id !== newRole.id) {
                console.warn(`Audit entry target ID ${auditEntry.target.id} does not match the updated role ID ${newRole.id}.`);
                return;
            }

            const updatedBy = auditEntry.executor || 'Unknown';

            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('Role Updated')
                .setDescription(`A role has been updated`)
                .addFields(
                    { name: 'Role Name', value: newRole.name, inline: true },
                    { name: 'Role ID', value: newRole.id, inline: true },
                    { name: 'Old Position', value: oldRole.position.toString(), inline: true },
                    { name: 'New Position', value: newRole.position.toString(), inline: true },
                    { name: 'Old Color', value: oldRole.color.toString(), inline: true },
                    { name: 'New Color', value: newRole.color.toString(), inline: true },
                    { name: 'Old Hoisted', value: oldRole.hoist ? 'Yes' : 'No', inline: true },
                    { name: 'New Hoisted', value: newRole.hoist ? 'Yes' : 'No', inline: true },
                    { name: 'Old Mentionable', value: oldRole.mentionable ? 'Yes' : 'No', inline: true },
                    { name: 'New Mentionable', value: newRole.mentionable ? 'Yes' : 'No', inline: true },
                    { name: 'Updated By', value: `<@${updatedBy.id}>`, inline: true }
                )
                .setFooter({ text: "Beacon | Role Update Logger" })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error handling roleUpdate event:', error);
        }
    }
};
