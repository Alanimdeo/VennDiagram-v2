console.log(
  `봇 로딩 중... 가동 시각: ${new Date().toLocaleString()}\n모듈 로딩 중...`
);
import { Collection, GatewayIntentBits, Message, VoiceState } from "discord.js";
import { readdirSync, readFileSync } from "fs";
import { Bot, Command, Config } from "./types";

console.log("설정 불러오는 중...");
let config: Config;
function loadConfig(path: string = "."): Config {
  try {
    const configFile = JSON.parse(readFileSync(`${path}/config.json`, "utf-8"));
    if (
      !configFile.token ||
      !configFile.adminPrefix ||
      !configFile.admins ||
      !Array.isArray(configFile.admins)
    ) {
      throw new Error("잘못된 설정 파일입니다.");
    }
    configFile.admins = configFile.admins.map((admin: string | number) =>
      String(admin)
    );
    return configFile as Config;
  } catch (err: any) {
    if (err?.code === "ENOENT" && path === ".") {
      return loadConfig("..");
    } else if (err?.code === "ENOENT") {
      throw new Error("설정 파일을 찾을 수 없습니다.");
    }
    throw err;
  }
}

try {
  config = loadConfig();
} catch (err) {
  console.error("설정 파일을 불러오는 중 오류가 발생했습니다.");
  console.error(err);
  process.exit(1);
}

console.log("봇 생성 중...");
const bot: Bot = new Bot({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

const path = readdirSync("./").includes("dist") ? "./dist" : ".";
const commands = readdirSync(`${path}/commands`).filter(
  (file: string) => file.endsWith(".js") || file.endsWith(".ts")
);
for (const file of commands) {
  const command: Command = require(`./commands/${file}`).default;
  console.log(`명령어 불러오는 중.. (${command.data.name})`);
  bot.commands.set(command.data.name, command);
}

const adminCommands = readdirSync(`${path}/adminCommands`).filter(
  (file: string) => file.endsWith(".js") || file.endsWith(".ts")
);
for (const file of adminCommands) {
  const command: Command = require(`./adminCommands/${file}`).default;
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
  if (!interaction.isChatInputCommand()) return;

  const command = bot.commands.get(interaction.commandName);
  if (!command) return;

  bot.lastInteraction = interaction;

  await command.execute(interaction, bot);
});

bot.on("messageCreate", async (message: Message) => {
  if (
    !message.content.startsWith(config.adminPrefix) ||
    !config.admins.includes(message.author.id)
  )
    return;

  const command = bot.adminCommands.get(message.content.split(" ")[1]);
  if (!command) return;

  await command.execute(message, bot);
});

bot.on("voiceStateUpdate", (_, newState: VoiceState) => {
  const guildQueue = bot.player.queue.get(newState.guild.id);
  if (!guildQueue || !guildQueue.connection.joinConfig.channelId) return;
  const channel = newState.guild.channels.cache.get(
    guildQueue.connection.joinConfig.channelId
  );
  if (!channel || !(channel.members instanceof Collection)) return;
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
