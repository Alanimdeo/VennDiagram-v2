"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log("모듈 불러오는 중...");
const config = require("./config.json");
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const types_1 = require("./types");
const bot = new types_1.Bot({
    intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES],
});
const commands = (0, fs_1.readdirSync)("./commands").filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of commands) {
    const command = require(`./commands/${file}`);
    console.log(`명령어 불러오는 중.. (${command.data.name})`);
    bot.commands.set(command.data.name, command);
}
const adminCommands = (0, fs_1.readdirSync)("./adminCommands").filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of adminCommands) {
    const command = require(`./adminCommands/${file}`);
    console.log(`관리자 명령어 불러오는 중.. (${command.data.description})`);
    bot.adminCommands.set(command.data.name, command);
}
bot.once("ready", () => {
    console.log(`로그인 완료! 토큰: \x1b[32m${config.token}\x1b[0m\n준비 완료!`);
});
bot.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand())
        return;
    const command = bot.commands.get(interaction.commandName);
    if (!command)
        return;
    await command.execute(interaction, bot);
});
bot.on("messageCreate", async (message) => {
    if (!message.content.startsWith(config.adminPrefix))
        return;
    const command = bot.adminCommands.get(message.content.split(" ")[1]);
    if (!command)
        return;
    await command.execute(message, bot);
});
bot.login(config.token);
