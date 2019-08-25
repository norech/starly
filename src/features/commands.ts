import Discord from "discord.js";
import { join } from "path";
import { readdirSync } from "fs";

export interface Command {
    description: string;
    execute(msg: Discord.Message, args: string[]): Promise<boolean>;
}

export const commandPrefix = process.env.COMMAND_PREFIX || "*";
export const commands: { [key: string]: Command } = {};

export function setup(client: Discord.Client) {

    readdirSync(join(__dirname, "..", "commands")).forEach((file) => {
        if(file.startsWith("-")) return;
        const name = file.endsWith(".js") ? file.substr(0, file.length - 3) : file; // We remove .js
        commands[name] = require("../commands/" + file).setup(client);
        console.log("Loading command '" + name + "'");
    });

    client.on("message", async (msg) => {
        const args = msg.content.split(" ");
        if(!args[0].startsWith(commandPrefix)) return;

        const commandName = args[0].substr(commandPrefix.length);
        console.log(msg.author.tag + " executed command '" + commandName + "'");

        if(typeof commands[commandName] === "undefined") {
            msg.channel.send(buildErrorReply(msg, {
                title: commandPrefix + commandName + " is inexistant",
                content: "This command was not found. Do " + commandPrefix + "help for help."
            }));
            return;
        }

        try {
            const isValidSyntax = await commands[commandName].execute(msg, args.slice(1));

            if(!isValidSyntax) {
                msg.channel.send(buildErrorReply(msg, {
                    title: "Invalid command syntax",
                    content: "You managed to find an issue with the bot. This issue was logged and we'll work on it as soon as possible."
                }));
            }
        } catch(ex) {
            msg.channel.send(buildErrorReply(msg, {
                title: "Something went wrong",
                content: "You managed to find an issue with the bot. This issue was logged and we'll work on it as soon as possible."
            }));
            console.error(msg.author.tag, msg.content, ex);
        }
    });

}

export function buildReply(msg: Discord.Message, args?: {content?: string, title?: string}) {

    let embed = new Discord.RichEmbed()
        .setColor('#7289DA')
        .setTimestamp()
        .setFooter("Asked by " + msg.author.username, msg.author.avatarURL);

    if(typeof args !== "undefined") {
        if(typeof args.content !== "undefined") {
            embed.setDescription(args.content);
        }
        if(typeof args.title !== "undefined") {
            embed.setTitle(args.title);
        }
    }

    return embed;
}

export function buildErrorReply(msg: Discord.Message, args?: {content?: string, title?: string}) {
    args = args || {};
    if(typeof args.title !== "string") {
        args.title = "Error";
    }

    return buildReply(msg, args).setColor("RED");
}

export function buildWarningReply(msg: Discord.Message, args?: {content?: string, title?: string}) {
    args = args || {};
    if(typeof args.title !== "string") {
        args.title = "Warning";
    }

    return buildReply(msg, args).setColor("GOLD");
}