const { Events, EmbedBuilder } = require('discord.js');
const AutoModSettings = require('../Schemas.js/automodSchemas');
const Whitelist = require('../Schemas.js/whitelistSchema'); 

module.exports = {
    name: Events.MessageDelete,
    async execute(deletedMessage) {
        if (!deletedMessage.guild || !deletedMessage.author || deletedMessage.author.bot) return;

        try {
            const guildId = deletedMessage.guild.id;
            const autoModData = await AutoModSettings.findOne({ guildId });
            const whitelistData = await Whitelist.findOne({ guildId }); 

            if (!autoModData || !autoModData.ghostPing) return;

            const isUserWhitelisted = whitelistData?.whitelist.users.includes(deletedMessage.author.id);
            const isRoleWhitelisted = deletedMessage.member.roles.cache.some(role => whitelistData?.whitelist.roles.includes(role.id));
            const isChannelWhitelisted = whitelistData?.whitelist.channels.includes(deletedMessage.channel.id);

            if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;

            if (deletedMessage.mentions.users.size > 0) {
                const mentionedUsers = deletedMessage.mentions.members;
                const messageContent = deletedMessage.content.toLowerCase();
                mentionedUsers.forEach(async user => {
                    if (!messageContent.includes(user.user.username.toLowerCase())) {
                        await logGhostPing(deletedMessage);
                    }
                });
            }
        } catch (error) {
            console.error('Error in Ghost Ping handler:', error);
        }
    }
};

async function logGhostPing(deletedMessage) {
    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`Ghost Ping Logged`)
        .setDescription(`A ghost ping has been detected.\n\n **Message:** ${deletedMessage.content}\n **Server:** ${deletedMessage.guild.name} (${deletedMessage.guild.id})\n **Channel:** ${deletedMessage.channel.name} (${deletedMessage.channel.id})\n **Sent by:** ${deletedMessage.author.tag} (${deletedMessage.author.id})`)
        .setFooter({ text: "Beacon | Ghost Ping Logger" })
        .setTimestamp();

    await sendLog(deletedMessage, embed);
}

async function sendLog(message, embed) {
    const logChannelData = await AutoModSettings.findOne({ guildId: message.guild.id });
    const logChannelId = logChannelData?.logChannelId;

    if (!logChannelId) return;

    const logChannel = message.guild.channels.cache.get(logChannelId);

    if (logChannel) {
        await logChannel.send({ embeds: [embed] });
    } else {
        console.error('Log channel not found.');
    }
}