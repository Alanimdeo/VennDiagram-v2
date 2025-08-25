"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log(`봇 로딩 중... 가동 시각: ${new Date().toLocaleString()}\n모듈 로딩 중...`);
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const types_1 = require("./types");
const moonlink_js_1 = require("moonlink.js");
const time_1 = require("./modules/time");
console.log("설정 불러오는 중...");
let config;
function loadConfig(path = ".") {
    try {
        const configFile = JSON.parse((0, fs_1.readFileSync)(`${path}/config.json`, "utf-8"));
        if (!configFile.token ||
            !configFile.adminPrefix ||
            !configFile.admins ||
            !Array.isArray(configFile.admins) ||
            !configFile.idleTimeout ||
            !configFile.lavalink) {
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
}, new moonlink_js_1.Manager({
    nodes: [
        {
            host: config.lavalink.host,
            port: config.lavalink.port,
            password: config.lavalink.password,
            secure: config.lavalink.secure,
        },
    ],
    options: {},
    sendPayload: (guildId, payload) => {
        const guild = bot.guilds.cache.get(guildId);
        if (guild) {
            guild.shard.send(JSON.parse(payload));
        }
    },
}));
const path = (0, fs_1.readdirSync)("./").includes("dist") ? "./dist" : ".";
const commands = (0, fs_1.readdirSync)(`${path}/commands`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of commands) {
    const command = require(`./commands/${file}`).default;
    console.log(`명령어 불러오는 중.. (${command.data.name})`);
    bot.commands.set(command.data.name, command);
}
const adminCommands = (0, fs_1.readdirSync)(`${path}/adminCommands`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of adminCommands) {
    const command = require(`./adminCommands/${file}`).default;
    console.log(`관리자 명령어 불러오는 중.. (${command.data.description})`);
    bot.adminCommands.set(command.data.name, command);
}
bot.once("clientReady", () => {
    console.log("Moonlink 매니저 초기화 완료!");
    console.log(`준비 완료! 토큰: \x1b[32m${config.token}\x1b[0m`);
    bot.manager.init(bot.user.id);
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
    if (!config.admins.includes(message.author.id))
        return;
    const content = message.content.split(" ");
    if (content[0] != config.adminPrefix)
        return;
    const command = bot.adminCommands.get(content[1]);
    if (!command)
        return;
    await command.execute(message, bot);
});
bot.on("voiceStateUpdate", (_, newState) => {
    const wrapper = bot.players.get(newState.guild.id);
    if (!wrapper || !wrapper.player.connected)
        return;
    const channel = newState.guild.channels.cache.get(wrapper.player.voiceChannelId);
    if (!channel || !(channel.members instanceof discord_js_1.Collection))
        return;
    const members = Array.from(channel.members.keys());
    if (members.length === 1 || !bot.user || !members.includes(bot.user.id)) {
        wrapper.player.stop({ destroy: true });
        bot.players.delete(newState.guild.id);
    }
});
bot.on("raw", (packet) => {
    bot.manager.packetUpdate(packet);
});
bot.manager.on("nodeConnected", (node) => {
    console.log(`Node ${node.identifier || node.host} connected`);
});
bot.manager.on("nodeDisconnect", (node) => {
    console.log(`Node ${node.identifier || node.host} disconnected`);
});
bot.manager.on("nodeError", (node, error) => {
    console.error(`Node ${node.identifier || node.host} encountered an error:`, error);
});
bot.manager.on("trackStart", (player, track) => {
    if (player.loop === "track")
        return;
    const channel = bot.channels.cache.get(player.textChannelId);
    const { name, avatar } = track.requestedBy;
    if (channel && channel.isSendable()) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#0067a3")
            .setTitle(":arrow_forward: 노래를 재생할게요")
            .setDescription(`[\`${track.title}\`](<${track.url}>) (${(0, time_1.timeString)(track.duration / 1000)})`)
            .setFooter({
            text: `${name} 님이 신청하셨어요.`,
            iconURL: avatar,
        });
        if (track.artworkUrl) {
            embed.setThumbnail(track.artworkUrl);
        }
        channel.send({
            embeds: [embed],
        });
    }
});
bot.manager.on("queueEnd", (player) => {
    const wrapper = bot.players.get(player.guildId);
    if (!wrapper)
        return;
    if (wrapper.quitTimer) {
        clearTimeout(wrapper.quitTimer);
        wrapper.quitTimer = null;
    }
    wrapper.quitTimer = setTimeout(() => {
        wrapper.player.destroy();
        bot.players.delete(player.guildId);
    }, config.idleTimeout);
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
