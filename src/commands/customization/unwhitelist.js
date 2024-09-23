const { SlashCommandBuilder } = require('discord.js');
const AutoModSettings = require('../../Schemas.js/whitelistSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwhitelist')
        .setDescription('Remove users, roles, or channels from the whitelist')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Remove a user from the whitelist')
                .addUserOption(option => 
                    option.setName('target').setDescription('User to unwhitelist').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('Remove a role from the whitelist')
                .addRoleOption(option => 
                    option.setName('target').setDescription('Role to unwhitelist').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Remove a channel from the whitelist')
                .addChannelOption(option => 
                    option.setName('target').setDescription('Channel to unwhitelist').setRequired(true))),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const subcommand = interaction.options.getSubcommand();
        
        let target;
        if (subcommand === 'user') {
            target = interaction.options.getUser('target');
        } else if (subcommand === 'role') {
            target = interaction.options.getRole('target');
        } else if (subcommand === 'channel') {
            target = interaction.options.getChannel('target');
        }

        try {
            const autoModData = await AutoModSettings.findOne({ guildId });

            if (!autoModData || !autoModData.whitelist) {
                return interaction.reply('No whitelist exists.');
            }

            if (subcommand === 'user') {
                autoModData.whitelist.users = autoModData.whitelist.users.filter(userId => userId !== target.id);
            } else if (subcommand === 'role') {
                autoModData.whitelist.roles = autoModData.whitelist.roles.filter(roleId => roleId !== target.id);
            } else if (subcommand === 'channel') {
                autoModData.whitelist.channels = autoModData.whitelist.channels.filter(channelId => channelId !== target.id);
            }

            await autoModData.save();
            interaction.reply(`${target.name || target.tag} has been removed from the whitelist.`);
        } catch (error) {
            console.error('Error in unwhitelisting:', error);
            interaction.reply({ content: 'An error occurred while unwhitelisting.', ephemeral: true });
        }
    },
};
