"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log(`봇 로딩 중... 가동 시각: ${new Date().toLocaleString()}\n모듈 로딩 중...`);
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const types_1 = require("./types");
console.log("설정 불러오는 중...");
let config;
function loadConfig(path = ".") {
    try {
        const configFile = JSON.parse((0, fs_1.readFileSync)(`${path}/config.json`, "utf-8"));
        if (!configFile.token || !configFile.adminPrefix || !configFile.admins || !Array.isArray(configFile.admins)) {
            throw new Error("잘못된 설정 파일입니다.");
        }
        configFile.admins = configFile.admins.map((admin) => String(admin));
        return configFile;
    }
    catch (err) {
        if (err?.code === "ENOENT" && path === ".") {
            return loadConfig("..");
        }
        else if (err?.code === "ENOENT") {
            throw new Error("설정 파일을 찾을 수 없습니다.");
        }
        throw err;
    }
}
try {
    config = loadConfig();
}
catch (err) {
    console.error("설정 파일을 불러오는 중 오류가 발생했습니다.");
    console.error(err);
    process.exit(1);
}
console.log("봇 생성 중...");
const bot = new types_1.Bot({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
const path = (0, fs_1.readdirSync)("./").includes("dist") ? "./dist" : ".";
const commands = (0, fs_1.readdirSync)(`${path}/commands`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of commands) {
    const command = require(`./commands/${file}`);
    console.log(`명령어 불러오는 중.. (${command.data.name})`);
    bot.commands.set(command.data.name, command);
}
const adminCommands = (0, fs_1.readdirSync)(`${path}/adminCommands`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of adminCommands) {
    const command = require(`./adminCommands/${file}`);
    console.log(`관리자 명령어 불러오는 중.. (${command.data.description})`);
    bot.adminCommands.set(command.data.name, command);
}
bot.once("ready", () => {
    console.log(`준비 완료! 토큰: \x1b[32m${config.token}\x1b[0m`);
});
bot.on("error", (err) => {
    console.error(err);
    exit();
});
bot.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const command = bot.commands.get(interaction.commandName);
    if (!command)
        return;
    bot.lastInteraction = interaction;
    await command.execute(interaction, bot);
});
bot.on("messageCreate", async (message) => {
    if (!message.content.startsWith(config.adminPrefix) || !config.admins.includes(message.author.id))
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
console.log("로그인 중...");
bot.login(config.token);
function exit() {
    console.log("종료 중...");
    bot.destroy();
    process.exit(0);
}
process.on("SIGINT", exit);
process.on("SIGTERM", exit);
