const { SlashCommandBuilder } = require('discord.js');
const AutoModSettings = require('../../Schemas.js/whitelistSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Whitelist users, roles, or channels')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Whitelist a user')
                .addUserOption(option => 
                    option.setName('target').setDescription('User to whitelist').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('Whitelist a role')
                .addRoleOption(option => 
                    option.setName('target').setDescription('Role to whitelist').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Whitelist a channel')
                .addChannelOption(option => 
                    option.setName('target').setDescription('Channel to whitelist').setRequired(true))),
    
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
                            const autoModData = await AutoModSettings.findOne({ guildId }) || new AutoModSettings({ guildId });
                            
                            if (!autoModData.whitelist) {
                                autoModData.whitelist = { users: [], roles: [], channels: [] };
                            }
                    
                            if (subcommand === 'user') {
                                if (autoModData.whitelist.users.includes(target.id)) {
                                    return interaction.reply(`${target.tag} is already whitelisted.`);
                                }
                                autoModData.whitelist.users.push(target.id);
                            } else if (subcommand === 'role') {
                                if (autoModData.whitelist.roles.includes(target.id)) {
                                    return interaction.reply(`${target.name} is already whitelisted.`);
                                }
                                autoModData.whitelist.roles.push(target.id);
                            } else if (subcommand === 'channel') {
                                if (autoModData.whitelist.channels.includes(target.id)) {
                                    return interaction.reply(`${target.name} is already whitelisted.`);
                                }
                                autoModData.whitelist.channels.push(target.id);
                            }
                    
                            await autoModData.save();
                            interaction.reply(`${target.name || target.tag} has been whitelisted.`);
                        } catch (error) {
                            console.error('Error in whitelisting:', error);
                            interaction.reply({ content: 'An error occurred while whitelisting.', ephemeral: true });
                        }
                    }
                }                    