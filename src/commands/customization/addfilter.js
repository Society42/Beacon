const { SlashCommandBuilder } = require('discord.js');
const AutoModSettings = require('../../Schemas.js/automodSchemas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addfilter')
        .setDescription('Add a word or phrase to the filter list')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('The word or phrase to add to the filter')
                .setRequired(true)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const word = interaction.options.getString('word').toLowerCase();

        try {
            let autoModData = await AutoModSettings.findOne({ guildId });

            if (!autoModData) {
                autoModData = new AutoModSettings({ guildId });
            }

            if (!autoModData.filters.includes(word)) {
                autoModData.filters.push(word);
                await autoModData.save();
                interaction.reply(`Added "${word}" to the filter list.`);
            } else {
                interaction.reply(`"${word}" is already in the filter list.`);
            }
        } catch (error) {
            console.error('Error adding filter:', error);
            interaction.reply({ content: 'An error occurred while adding the filter.', ephemeral: true });
        }
    },
};
