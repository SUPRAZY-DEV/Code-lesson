const Discord = require('discord.js');
const bot = new Discord.Client();
let dejavu = new Map();
let time = new Map();

bot.on("message", message => {
    if (message.channel.type === "dm") {
        bot.emit("messageprivee", message)
    }
})

bot.on("messageprivee", message => {

    if (time.has(message.author.id)) return message.channel.send("Tu as fermé un ticket trop récemment.");
    if (!dejavu.has(message.author.id)) {

        let guild = client.guilds.cache.get("731965139653230592");
        let channel = client.channels.cache.get("731965139653230595") // message.guild.channels.cache.find(channel => channel.name === "LE NOM DU CHANNEL")
        dejavu.set(message.author.id, message.channel.id)
        message.channel.send("Votre ticket a bien été pris en compte.")
        let messagetostaff = await channel.send(message.content);
        await messagetostaff.react("❌");
        await messagetostaff.react("🟢");
        let role = guild.roles.cache.get("731965290820272169") // message.guild.roles.cache.find(role => role.name === "NOM DU ROLE");
        try {
            let filtre = (reaction, user) => ["❌", "🟢"].includes(reaction.emoji.name) && !user.bot;
            let reactionCollection = await messagetostaff.awaitReactions(filtre, {
                max: 1,
                time: 86400000
            });
            let choix = reactionCollection.get("❌") || reactionCollection.get("🟢");
            switch (choix.emoji.name) {
                case "❌":
                    message.author.send("Votre ticket a été refusé.");
                    dejavu.delete(message.author.id)
                    time.set(message.author.id, message.channel);
                    setTimeout(() => {
                        time.delete(message.author.id);
                    }, 100000)
                    break;
                case "🟢":
                    message.author.send("Votre ticket a été accepté.");
                    collectors(channel, message);
            }
        } catch (err) {
            console.log(err)
            message.author.send("Votre requête n'a pas été convaincante.");
            dejavu.delete(message.author.id);
            time.add(message.author.id, message.channel);
            setTimeout(() => {
                time.delete(message.author.id);
            }, 10000);
        }
    }

    function collectors(channel, message) {
        let filter = m => m.channel.id === channel.id && !m.author.bot;
        let channelCollector = channel.createMessageCollector(filter);
        let filter1 = m => m.channel.id === message.channel.id && m.author.id === message.author.id;
        let DMCollector = message.channel.createMessageCollector(filter1);
        return new Promise((resolve, reject) => {
            DMCollector.on("collect", m => {
                if (m.attachments.size !== 0) {
                    getImages(m.attachments, channel)
                }
                channel.send(m.content);
            })
            channelCollector.on("collect", m => {
                if (m.content === "!fermer") {
                    message.channel.send("Votre ticket a été bien fermé.")
                    dejavu.delete(message.author.id)
                    time.set(message.author.id, message.channel)
                    setTimeout(() => {
                        time.delete(message.author.id);
                    }, 10000);
                    DMCollector.stop();
                    channelCollector.stop();
                } else {
                    if (m.attachments.size !== 0) {
                        getImages(m.attachments, message)
                    }
                    message.channel.send(m.content);
                }

            })

        })
    }

    function getImages(fichiers, channel) {
        const validation = /^.*(gif|png|jpg|jpeg)$/g;
        let images = fichiers.array().filter(image => validation.test(image.url)).map(image => image.url);
        console.log(images)
        channel.send({
            files: images
        });
    }
})

bot.login('YOUR TOKEN')
