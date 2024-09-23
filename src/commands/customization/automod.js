const { SlashCommandBuilder } = require('discord.js');
const AutoModSettings = require('../../Schemas.js/automodSchemas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Manage auto-moderation settings for the server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable a specific auto-moderation feature')
                .addStringOption(option =>
                    option.setName('feature')
                        .setDescription('The feature to enable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Ghost Ping', value: 'ghostPing' },
                            { name: 'Spam', value: 'spam' },
                            { name: 'Links', value: 'links' },
                            { name: 'Word Filter', value: 'wordFilter' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable a specific auto-moderation feature')
                .addStringOption(option =>
                    option.setName('feature')
                        .setDescription('The feature to disable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Ghost Ping', value: 'ghostPing' },
                            { name: 'Spam', value: 'spam' },
                            { name: 'Links', value: 'links' },
                            { name: 'Word Filter', value: 'wordFilter' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setchannel')
                .setDescription('Set the logging channel for auto-moderation')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel where logs should be sent')
                        .setRequired(true)
                )),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const subcommand = interaction.options.getSubcommand();

        try {
            let autoModData = await AutoModSettings.findOne({ guildId });

            if (!autoModData) {
                autoModData = new AutoModSettings({
                    guildId,
                    ghostPing: false,
                    spam: false,
                    links: false,
                    wordFilter: false,
                    logChannelId: null, 
                });
            }

            if (subcommand === 'setchannel') {
                const logChannel = interaction.options.getChannel('channel');
                autoModData.logChannelId = logChannel.id;
                await autoModData.save();
                return interaction.reply(`Log channel for auto-moderation set to <#${logChannel.id}>.`);
            }

            const feature = interaction.options.getString('feature');

            autoModData[feature] = (subcommand === 'enable');

            await autoModData.save();
            interaction.reply(`Auto-moderation for **${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}** is now **${subcommand === 'enable' ? 'enabled' : 'disabled'}**.`);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'An error occurred while updating the auto-moderation settings.', ephemeral: true });
        }
    },
};
