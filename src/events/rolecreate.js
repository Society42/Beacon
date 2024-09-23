const { Events, EmbedBuilder } = require('discord.js');
const LogSettingsSchema = require('../Schemas.js/serverlogsSchemas');

module.exports = {
    name: Events.GuildRoleCreate,
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
                type: 30, 
            });

            const createdBy = fetchedLogs.entries.first()?.executor || 'Unknown';

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Role Created')
                .setDescription(`A new role was created`)
                .addFields(
                    { name: 'Role Name', value: role.name, inline: true },
                    { name: 'Role ID', value: role.id, inline: true },
                    { name: 'Position', value: role.position.toString(), inline: true },
                    { name: 'Color', value: role.color.toString(), inline: true },
                    { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                    { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                    { name: 'Created By', value: `<@${createdBy.id}>`, inline: true }
                )
                .setFooter({ text: "Beacon | Role Creation Logger" })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error handling roleCreate event:', error);
        }
    }
};
