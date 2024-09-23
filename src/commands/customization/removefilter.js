const { SlashCommandBuilder } = require('discord.js');
const AutoModSettings = require('../../Schemas.js/automodSchemas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removefilter')
        .setDescription('Remove a word or phrase from the filter list')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('The word or phrase to remove from the filter')
                .setRequired(true)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const word = interaction.options.getString('word').toLowerCase();

        try {
            const autoModData = await AutoModSettings.findOne({ guildId });

            if (!autoModData || !autoModData.filters.includes(word)) {
                return interaction.reply(`"${word}" is not in the filter list.`);
            }

            autoModData.filters = autoModData.filters.filter(filter => filter !== word);
            await autoModData.save();

            interaction.reply(`Removed "${word}" from the filter list.`);
        } catch (error) {
            console.error('Error removing filter:', error);
            interaction.reply({ content: 'An error occurred while removing the filter.', ephemeral: true });
        }
    },
};
