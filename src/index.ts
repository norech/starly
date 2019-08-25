import Discord from "discord.js";
import { join } from "path";
import { readdirSync } from "fs";
const client = new Discord.Client();

require('dotenv').config();

client.on("ready", () => {
    client.user.setActivity(process.env.COMMAND_PREFIX + "help", { type: "PLAYING" });
});

readdirSync(join(__dirname, "features"))
    .forEach((file) => {
        if(file.startsWith("-")) return;
        const name = file.endsWith(".js") ? file.substr(0, file.length - 3) : file; // We remove .js
        console.log("Loading feature '" + name + "'")
        require("./features/" + file).setup(client);
    });

client.login(process.env.DISCORD_TOKEN);