const { Events, EmbedBuilder } = require('discord.js');
const LogSettingsSchema = require('../Schemas.js/serverlogsSchemas');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        const guildId = message.guild.id;

        try {
            const logSettings = await LogSettingsSchema.findOne({ guildId });
            
            if (!logSettings || !logSettings.messageLogs) return;

            const logChannelId = logSettings.logChannelId;

            if (!logChannelId) return;

            const logChannel = message.guild.channels.cache.get(logChannelId);
            if (!logChannel) {
                console.error(`Log channel with ID ${logChannelId} not found in guild ${guildId}`);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Message Deleted')
                .setDescription(`A message was deleted in <#${message.channel.id}>`)
                .addFields(
                    { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Channel', value: `${message.channel.name} (${message.channel.id})`, inline: true },
                    { name: 'Message Content', value: message.content || 'No Content', inline: false }
                )
                .setFooter({ text: "Beacon | Message Delete Logger" })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error handling messageDelete event:', error);
        }
    }
};
