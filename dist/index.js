"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("모듈 불러오는 중...");
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const readline_1 = require("readline");
const types_1 = require("./types");
const config_1 = __importDefault(require("./config"));
console.log("봇 생성 중...");
const bot = new types_1.Bot({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.MessageContent, // 테스트로 추가해봄. 얘 때문에 awaitMessages가 작동 안 했던 건가?
    ],
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
    console.log(`준비 완료! 토큰: \x1b[32m${config_1.default.token}\x1b[0m`);
});
bot.on("interactionCreate", async (interaction) => {
    if (interaction.type !== discord_js_1.InteractionType.ApplicationCommand)
        return;
    const command = bot.commands.get(interaction.commandName);
    if (!command)
        return;
    bot.lastInteraction = interaction;
    await command.execute(interaction, bot);
});
bot.on("messageCreate", async (message) => {
    if (!message.content.startsWith(config_1.default.adminPrefix) || !config_1.default.admins.includes(message.author.id))
        return;
    const command = bot.adminCommands.get(message.content.split(" ")[1]);
    if (!command)
        return;
    await command.execute(message, bot);
});
bot.on("voiceStateUpdate", (_, newState) => {
    const guildQueue = bot.player.queue.get(newState.guild.id);
    if (!guildQueue || !guildQueue.connection.joinConfig.channelId)
        return;
    const channel = newState.guild.channels.cache.get(guildQueue.connection.joinConfig.channelId);
    if (!channel || !(channel.members instanceof discord_js_1.Collection))
        return;
    const members = Array.from(channel.members.keys());
    if (members.length === 1 || !bot.user || !members.includes(bot.user.id)) {
        guildQueue.audioPlayer.stop(true);
        guildQueue.connection.destroy();
        bot.player.queue.delete(newState.guild.id);
    }
});
const consoleCommands = (0, fs_1.readdirSync)("./consoleCommands").filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of consoleCommands) {
    const command = require(`./consoleCommands/${file}`);
    console.log(`콘솔 명령어 불러오는 중.. (${command.data.description})`);
    bot.consoleCommands.set(command.data.name, command);
}
const consoleCompletion = bot.consoleCommands.map((command) => command.data.name);
const consoleInput = (0, readline_1.createInterface)({
    input: process.stdin,
    output: process.stdout,
    completer: (line) => {
        const hits = consoleCompletion.filter((c) => c.startsWith(line));
        return [hits.length ? hits : consoleCompletion, line];
    },
});
consoleInput.on("line", async (line) => {
    try {
        const commandLine = line.split(" ");
        if (commandLine.length === 0 || commandLine === undefined)
            return;
        const command = bot.consoleCommands.get(commandLine.shift());
        if (command) {
            const result = await command.execute(commandLine, bot);
            if (result) {
                console.log(result);
            }
        }
        else {
            console.log(eval(line));
        }
    }
    catch (err) {
        console.error(err);
    }
});
console.log("로그인 중...");
bot.login(config_1.default.token);
const exit = require("./consoleCommands/exit").execute;
process.on("SIGINT", async () => {
    await exit([], bot);
});
process.on("SIGTERM", async () => {
    await exit([], bot);
});
process.on("SIGTERM", async () => {
    await exit([], bot);
});
