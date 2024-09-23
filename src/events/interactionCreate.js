const { Interaction } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isButton()) {
            if (interaction.customId === 'open_ticket') {
                // Handle opening a ticket here (same code as previously provided)
                const user = interaction.user;
                const guild = interaction.guild;

                let category = guild.channels.cache.find(
                    (c) => c.type === 'GUILD_CATEGORY' && c.name === 'Tickets'
                );

                if (!category) {
                    category = await guild.channels.create('Tickets', {
                        type: 'GUILD_CATEGORY',
                    });
                }

                const ticketChannel = await guild.channels.create(
                    `ticket-${user.username}`,
                    {
                        type: 'GUILD_TEXT',
                        parent: category,
                    }
                );

                await ticketChannel.permissionOverwrites.create(user, {
                    VIEW_CHANNEL: true,
                    SEND_MESSAGES: true,
                    READ_MESSAGE_HISTORY: true,
                });

                await ticketChannel.send(`Welcome ${user} to your ticket channel!`);

                await interaction.reply({
                    content: `Ticket channel created: ${ticketChannel}`,
                    ephemeral: true,
                });
            }
        } else if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.log(error);
                await interaction.reply({
                    content: 'There was an error while executing this command!', 
                    ephemeral: true,
                });
            }
        }
    },
};
