const { SlashCommandBuilder } = require('discord.js');
const AutoModSettings = require('../../Schemas.js/automodSchemas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewfilter')
        .setDescription('View all set filters'),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        try {
            const autoModData = await AutoModSettings.findOne({ guildId });

            if (!autoModData || autoModData.filters.length === 0) {
                return interaction.reply('No filters have been set.');
            }

            const filterList = autoModData.filters.join(', ');
            interaction.reply(`Current filters: ${filterList}`);
        } catch (error) {
            console.error('Error viewing filters:', error);
            interaction.reply({ content: 'An error occurred while retrieving the filters.', ephemeral: true });
        }
    },
};
