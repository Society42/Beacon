const { Events, EmbedBuilder } = require('discord.js');
const AutoModSettings = require('../Schemas.js/automodSchemas');
const Whitelist = require('../Schemas.js/whitelistSchema');

const spamMap = new Map(); 

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        try {
            const guildId = message.guild.id;
            const autoModData = await AutoModSettings.findOne({ guildId });
            const whitelistData = await Whitelist.findOne({ guildId }); 

            if (!autoModData || !autoModData.spam) return;

            const isUserWhitelisted = whitelistData?.whitelist.users.includes(message.author.id);
            const isRoleWhitelisted = message.member.roles.cache.some(role => whitelistData?.whitelist.roles.includes(role.id));
            const isChannelWhitelisted = whitelistData?.whitelist.channels.includes(message.channel.id);

            if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;

            const now = Date.now();
            const userId = message.author.id;

            if (!spamMap.has(userId)) {
                spamMap.set(userId, []);
            }

            const timestamps = spamMap.get(userId);
            timestamps.push(now);

            const timeLimit = 5000;
            while (timestamps.length && (now - timestamps[0] > timeLimit)) {
                timestamps.shift();
            }

            if (timestamps.length > 3) {
                await handleExcessivePings(message);
            }
        } catch (error) {
            console.error('Error in Excessive Pings handler:', error);
        }
    }
};

async function handleExcessivePings(message) {
    await message.delete();

    const warningMessage = await message.channel.send(`<@${message.author.id}>, please refrain from spamming in this server.`);

    setTimeout(() => {
        warningMessage.delete().catch(console.error);
    }, 5000);

    const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`Spam Logged`)
        .setDescription(`Spamming has been detected.\n\n **Message:** ${message.content}\n **Server:** ${message.guild.name} (${message.guild.id})\n **Channel:** ${message.channel.name} (${message.channel.id})\n **Sent by:** ${message.author.tag} (${message.author.id})`)
        .setFooter({ text: "Beacon | Spam Logger" })
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