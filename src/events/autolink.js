const { Events, EmbedBuilder } = require('discord.js');
const AutoModSettings = require('../Schemas.js/automodSchemas');
const WhitelistSchema = require('../Schemas.js/whitelistSchema'); 

async function isWhitelisted(guildId, userId, roleId, channelId) {
    const autoModData = await WhitelistSchema.findOne({ guildId }); 

    if (!autoModData || !autoModData.whitelist) {
        return false; 
    }

    const isUserWhitelisted = autoModData.whitelist.users.includes(userId);
    const isRoleWhitelisted = autoModData.whitelist.roles.includes(roleId);
    const isChannelWhitelisted = autoModData.whitelist.channels.includes(channelId);

    return isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        try {
            const guildId = message.guild.id;
            const userId = message.author.id;
            const roleId = message.member.roles.highest.id;
            const channelId = message.channel.id;

            const isWhitelistedCheck = await isWhitelisted(guildId, userId, roleId, channelId);
            const autoModData = await AutoModSettings.findOne({ guildId });
            if (!autoModData || !autoModData.links) return;

            const messageContent = message.content;
            const urlPattern = /https?:\/\/[^\s]+/i;

            if (urlPattern.test(messageContent)) {
                if (isWhitelistedCheck) {
                    await logWhitelistedLink(message);
                } else {
                    await handleLinkDetection(message);
                }
            }
        } catch (error) {
            console.error('Error in Link Detection handler:', error);
        }
    }
};

async function handleLinkDetection(message) {
    await message.delete();

    const warningMessage = await message.channel.send(`<@${message.author.id}>, posting links is not allowed in this server.`);

    setTimeout(() => {
        warningMessage.delete().catch(console.error);
    }, 5000);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`Link Detected`)
        .setDescription(`A link has been detected and removed.\n\n **Message:** ${message.content}\n **Server:** ${message.guild.name} (${message.guild.id})\n **Channel:** ${message.channel.name} (${message.channel.id})\n **Sent by:** ${message.author.tag} (${message.author.id})`)
        .setFooter({ text: "Beacon | Link Detection Logger" })
        .setTimestamp();

    await sendLog(message, embed);
}

async function logWhitelistedLink(message) {
    const embed = new EmbedBuilder()
        .setColor("Orange") 
        .setTitle(`Whitelisted User Posted a Link`)
        .setDescription(`A whitelisted user posted a link.\n\n **Message:** ${message.content}\n **Server:** ${message.guild.name} (${message.guild.id})\n **Channel:** ${message.channel.name} (${message.channel.id})\n **Sent by:** ${message.author.tag} (${message.author.id})`)
        .setFooter({ text: "Beacon | Whitelisted Link Logger" })
        .setTimestamp();

    await sendLog(message, embed);
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
