const { Events, EmbedBuilder } = require('discord.js');
const AutoModSettings = require('../Schemas.js/automodSchemas');
const Whitelist = require('../Schemas.js/whitelistSchema'); 

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        try {
            const guildId = message.guild.id;
            const autoModData = await AutoModSettings.findOne({ guildId });
            const whitelistData = await Whitelist.findOne({ guildId });

            if (!autoModData || !autoModData.wordFilter) return;

            const messageContent = message.content.toLowerCase();
            const blockedWords = autoModData.filters.map(word => word.toLowerCase());

            console.log(`Message Content: ${messageContent}`);
            console.log(`Blocked Words: ${blockedWords}`);

            const isUserWhitelisted = whitelistData?.whitelist.users.includes(message.author.id);
            const isRoleWhitelisted = message.member.roles.cache.some(role => whitelistData?.whitelist.roles.includes(role.id));
            const isChannelWhitelisted = whitelistData?.whitelist.channels.includes(message.channel.id);

            const isBlocked = blockedWords.some(word => messageContent.includes(word));

            console.log(`Is Blocked: ${isBlocked}`);

            if (isBlocked && !isUserWhitelisted && !isRoleWhitelisted && !isChannelWhitelisted) {
                await handleBlockedWord(message);
            } else if ((isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) && isBlocked) {
                await logWhitelistedUsage(message);
            }
        } catch (error) {
            console.error('Error in Blocked Words handler:', error);
        }
    }
};

async function handleBlockedWord(message) {
    await message.delete();

    const notification = await message.channel.send(`<@${message.author.id}>, that word is banned from the server.`);

    setTimeout(() => {
        notification.delete().catch(console.error);
    }, 5000);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`Blocked Word Detected`)
        .setDescription(`A blocked word has been detected.\n\n **Message:** ${message.content}\n **Server:** ${message.guild.name} (${message.guild.id})\n **Channel:** ${message.channel.name} (${message.channel.id})\n **Sent by:** ${message.author.tag} (${message.author.id})`)
        .setFooter({ text: "Beacon | Blocked Word Logger" })
        .setTimestamp();

    await sendLog(message, embed);
}

async function logWhitelistedUsage(message) {
    const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle(`Whitelisted User Used Blocked Word`)
        .setDescription(`A whitelisted user posted a blocked word.\n\n **Message:** ${message.content}\n **Server:** ${message.guild.name} (${message.guild.id})\n **Channel:** ${message.channel.name} (${message.channel.id})\n **Sent by:** ${message.author.tag} (${message.author.id})`)
        .setFooter({ text: "Beacon | Whitelisted Usage Logger" })
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