import Discord, { TextChannel, Channel } from "discord.js";
import { registerCleanup } from "../cleanup";

export function setup(client: Discord.Client) {

    let messagesCount: { [key: string]: number } = {};
    let originalRateLimit: { [key: string]: number } = {};

    // Clear message count every 2 seconds
    setInterval(() => {
        messagesCount = {};
    }, 2000);

    client.on("message", (msg) => {
        if(msg.channel.type != "text") return;
        const textChannel = msg.channel as TextChannel;
        const channelId = textChannel.id;

        if(typeof messagesCount[channelId] === "undefined") {
            messagesCount[channelId] = 0;
        }

        if(++messagesCount[channelId] > 3 && !isRateLimited(textChannel)) {
            textChannel.send("You all are sending too many messages! I temporary rate-limited this channel.");
            
            originalRateLimit[channelId] = textChannel.rateLimitPerUser;
            textChannel.setRateLimitPerUser(10, "Spam Prevention");

            const channelLogData = buildChannelLogData(textChannel);
            console.log("Enabled rate limit for channel " + channelLogData);

            delete messagesCount[channelId];

            setTimeout(() => {
                textChannel.setRateLimitPerUser(originalRateLimit[channelId], "Stopped Spam Prevention");

                console.log("Disabled rate limit for channel " + channelLogData);

                delete originalRateLimit[channelId];
            }, 10000)
        }
    });

    registerCleanup(() => {
        var promises: Array<Promise<any>> = [];

        for(var channel of client.channels.array()) {
            if(channel.type != "text" || !isRateLimited(channel)) {
                continue;
            }

            const textChannel = channel as TextChannel;

            promises.push(
                textChannel.setRateLimitPerUser(originalRateLimit[textChannel.id], "Stopped Spam Prevention")
            );
        }

        return Promise.all(promises);
    });

    // BELOW ARE THE HELPERS

    function isRateLimited(channel: Channel) {
        // if originalRateLimit key exists, it means that we rate limited
        return typeof originalRateLimit[channel.id] !== "undefined";
    }

    function buildChannelLogData(textChannel: TextChannel) {
        return (
            textChannel.id + " "
            + "'" + textChannel.name + "' "
            + "("
            + "category: " + textChannel.parentID + " '" + textChannel.parent.name + "', "
            + "guild: " + textChannel.guild.id + " '" + textChannel.guild.name + "', "
            + "defined rate limit: " + originalRateLimit[textChannel.id]
            + ")"
        );
    }

}