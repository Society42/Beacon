const { SlashCommandBuilder } = require('discord.js');
const ModRole = require('../../Schemas.js/modroleSchema'); // Adjust the path as necessary

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmodrole')
    .setDescription('Set the moderator role for the server')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to set as moderator')
        .setRequired(true)),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const guildId = interaction.guild.id;

    try {
      let modRoleData = await ModRole.findOne({ guildId });

      if (modRoleData) {
        modRoleData.roleId = role.id;
        await modRoleData.save();
      } else {
        modRoleData = new ModRole({ guildId, roleId: role.id });
        await modRoleData.save();
      }

      interaction.reply(`Moderator role successfully changed to <@&${role.id}>`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while saving the new moderator role.', ephemeral: true });
    }
  },
};
