const { Events, EmbedBuilder } = require('discord.js');
const LogSettingsSchema = require('../Schemas.js/serverlogsSchemas');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (!newMessage.guild || newMessage.author.bot) return;

        const guildId = newMessage.guild.id;

        try {
            const logSettings = await LogSettingsSchema.findOne({ guildId });
            
            if (!logSettings || !logSettings.messageLogs) return;

            const logChannelId = logSettings.logChannelId;

            if (!logChannelId) return;

            const logChannel = newMessage.guild.channels.cache.get(logChannelId);
            if (!logChannel) {
                console.error(`Log channel with ID ${logChannelId} not found in guild ${guildId}`);
                return;
            }

            if (oldMessage.content === newMessage.content) return;

            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('Message Updated')
                .setDescription(`A message was edited in <#${newMessage.channel.id}>`)
                .addFields(
                    { name: 'Author', value: `${newMessage.author.tag} (${newMessage.author.id})`, inline: true },
                    { name: 'Channel', value: `${newMessage.channel.name} (${newMessage.channel.id})`, inline: true },
                    { name: 'Old Content', value: oldMessage.content || 'No Content', inline: false },
                    { name: 'New Content', value: newMessage.content || 'No Content', inline: false }
                )
                .setFooter({ text: "Beacon | Message Update Logger" })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error handling messageUpdate event:', error);
        }
    }
};
