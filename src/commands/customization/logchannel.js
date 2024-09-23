const { SlashCommandBuilder } = require('discord.js');
const AutoModSettings = require('../../Schemas.js/logchannelSchemas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogchannel')
        .setDescription('Set the logging channel for auto moderation events')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to log messages')
                .setRequired(true)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const logChannel = interaction.options.getChannel('channel');

        try {
            let autoModData = await AutoModSettings.findOne({ guildId });

            if (!autoModData) {
                autoModData = new AutoModSettings({ guildId });
            }

            autoModData.logChannelId = logChannel.id;
            await autoModData.save();

            interaction.reply(`Log channel has been set to <#${logChannel.id}>.`);
        } catch (error) {
            console.error('Error setting log channel:', error);
            interaction.reply({ content: 'An error occurred while setting the log channel.', ephemeral: true });
        }
    },
};
