require('dotenv').config(); 
const { ActivityType } = require('discord.js');
const mongoose = require('mongoose');

const mongodbURL = process.env.MONGODBURL;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Ready!');

        if (!mongodbURL) {
            console.error('MongoDB URL is missing from environment variables!');
            return;
        }

        try {
            await mongoose.connect(mongodbURL, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('The database is connected!');
        } catch (error) {
            console.error('Failed to connect to MongoDB:', error);
        }

        const statusArray = [
            { content: 'Monitoring the server', type: ActivityType.Watching, status: 'online' },
            { content: 'Managing AutoMod', type: ActivityType.Playing, status: 'dnd' }
        ];

        async function pickPresence() {
            const option = Math.floor(Math.random() * statusArray.length);

            try {
                await client.user.setPresence({
                    activities: [{ name: statusArray[option].content, type: statusArray[option].type }],
                    status: statusArray[option].status
                });
            } catch (error) {
                console.error('Error setting presence:', error);
            }
        }

        pickPresence();
    }
};
