const { SlashCommandBuilder } = require('@discordjs/builders');
const LogSettingsSchema = require('../../Schemas.js/serverlogsSchemas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-logs')
        .setDescription('Setup and manage server logs')
        .addSubcommand(subcommand =>
            subcommand.setName('enable')
                .setDescription('Enable a specific log type')
                .addStringOption(option =>
                    option.setName('logtype')
                        .setDescription('The type of logs to enable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Channel Logs', value: 'channelLogs' },
                            { name: 'Message Logs', value: 'messageLogs' },
                            { name: 'User Logs', value: 'userLogs' },
                            { name: 'Role Logs', value: 'roleLogs' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('disable')
                .setDescription('Disable a specific log type')
                .addStringOption(option =>
                    option.setName('logtype')
                        .setDescription('The type of logs to disable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Channel Logs', value: 'channelLogs' },
                            { name: 'Message Logs', value: 'messageLogs' },
                            { name: 'User Logs', value: 'userLogs' },
                            { name: 'Role Logs', value: 'roleLogs' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('setchannel')
                .setDescription('Set the logging channel for server logs')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel where logs should be sent')
                        .setRequired(true)
                )
        ),
        
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            if (subcommand === 'setchannel') {
                const logChannel = interaction.options.getChannel('channel');
                
                await LogSettingsSchema.findOneAndUpdate(
                    { guildId },
                    { logChannelId: logChannel.id },
                    { upsert: true, new: true }
                );
                
                return interaction.reply({
                    content: `Log channel has been successfully set to <#${logChannel.id}>.`,
                    ephemeral: true,
                });
            }

            const logType = interaction.options.getString('logtype');
            const updateData = {};
            updateData[logType] = subcommand === 'enable';

            await LogSettingsSchema.findOneAndUpdate(
                { guildId },
                updateData,
                { upsert: true, new: true }
            );

            const action = subcommand === 'enable' ? 'enabled' : 'disabled';
            return interaction.reply({
                content: `Successfully ${action} ${logType.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
                ephemeral: true,
            });

        } catch (error) {
            console.error('Error processing server-logs command:', error);
            return interaction.reply({
                content: 'There was an error processing your request. Please try again later.',
                ephemeral: true,
            });
        }
    }
};
