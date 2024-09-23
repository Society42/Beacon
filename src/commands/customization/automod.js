const { SlashCommandBuilder } = require('discord.js');
const AutoModSettings = require('../../Schemas.js/automodSchemas'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('toggleautomod')
    .setDescription('Manage auto-moderation settings for the server')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ghostping')
        .setDescription('Toggle ghost ping protection')
        .addStringOption(option =>
          option.setName('state')
            .setDescription('On or Off')
            .setRequired(true)
            .addChoices(
              { name: 'On', value: 'on' },
              { name: 'Off', value: 'off' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('spam')
        .setDescription('Toggle spam protection')
        .addStringOption(option =>
          option.setName('state')
            .setDescription('On or Off')
            .setRequired(true)
            .addChoices(
              { name: 'On', value: 'on' },
              { name: 'Off', value: 'off' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('links')
        .setDescription('Toggle link protection')
        .addStringOption(option =>
          option.setName('state')
            .setDescription('On or Off')
            .setRequired(true)
            .addChoices(
              { name: 'On', value: 'on' },
              { name: 'Off', value: 'off' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('wordfilter')
        .setDescription('Toggle filter for specific words/phrases')
        .addStringOption(option =>
          option.setName('state')
            .setDescription('On or Off')
            .setRequired(true)
            .addChoices(
              { name: 'On', value: 'on' },
              { name: 'Off', value: 'off' }
            ))),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();
    const state = interaction.options.getString('state');

    try {
      let autoModData = await AutoModSettings.findOne({ guildId });

      if (!autoModData) {
        autoModData = new AutoModSettings({ guildId, ghostPing: false, spam: false, links: false, wordFilter: false, excessivePings: false, excessiveEmojis: false, toxicBehavior: false });
      }

      switch (subcommand) {
        case 'ghostping':
          autoModData.ghostPing = (state === 'on');
          break;
        case 'spam':
          autoModData.spam = (state === 'on');
          break;
        case 'links':
          autoModData.links = (state === 'on');
          break;
        case 'wordfilter':
          autoModData.wordFilter = (state === 'on');
          break;
      }

      await autoModData.save();
      interaction.reply(`Auto-moderation for **${subcommand}** is now **${state}**.`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while updating the auto-moderation settings.', ephemeral: true });
    }
  },
};
