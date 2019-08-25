import Discord from "discord.js";
import { Command, buildReply, commands, commandPrefix } from "../features/commands";

export class HelpCommand implements Command {
    description = "Shows help.";

    constructor(client: Discord.Client) {
        
    }

    async execute(msg: Discord.Message, args: string[]) {
        let reply = buildReply(msg, {
            title: "Help",
            content: "These are the commands you can use:"
        });

        for(const commandName in commands) {
            const command = commands[commandName];
            reply.addField(commandPrefix + commandName, command.description);
        }

        msg.channel.send(reply)
        return true;
    }
}

export function setup(client: Discord.Client) {
    return new HelpCommand(client);
}
