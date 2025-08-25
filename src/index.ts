console.log(
  `봇 로딩 중... 가동 시각: ${new Date().toLocaleString()}\n모듈 로딩 중...`
);
import {
  Collection,
  EmbedBuilder,
  GatewayIntentBits,
  Message,
  VoiceState,
} from "discord.js";
import { readdirSync, readFileSync } from "fs";
import { Bot, Command, Config } from "./types";
import { Manager } from "moonlink.js";
import { timeString } from "./modules/time";

console.log("설정 불러오는 중...");
let config: Config;
function loadConfig(path: string = "."): Config {
  try {
    const configFile = JSON.parse(readFileSync(`${path}/config.json`, "utf-8"));
    if (
      !configFile.token ||
      !configFile.adminPrefix ||
      !configFile.admins ||
      !Array.isArray(configFile.admins) ||
      !configFile.idleTimeout ||
      !configFile.lavalink
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

const bot: Bot = new Bot(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ],
  },
  new Manager({
    nodes: [
      {
        host: config.lavalink.host,
        port: config.lavalink.port,
        password: config.lavalink.password,
        secure: config.lavalink.secure,
      },
    ],
    options: {},
    sendPayload: (guildId: string, payload: string) => {
      const guild = bot.guilds.cache.get(guildId);
      if (guild) {
        guild.shard.send(JSON.parse(payload));
      }
    },
  })
);

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

bot.once("clientReady", () => {
  console.log("Moonlink 매니저 초기화 완료!");
  console.log(`준비 완료! 토큰: \x1b[32m${config.token}\x1b[0m`);

  bot.manager.init(bot.user!.id);
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
  if (!config.admins.includes(message.author.id)) return;

  const content = message.content.split(" ");
  if (content[0] != config.adminPrefix) return;

  const command = bot.adminCommands.get(content[1]);
  if (!command) return;

  await command.execute(message, bot);
});

bot.on("voiceStateUpdate", (_, newState: VoiceState) => {
  const wrapper = bot.players.get(newState.guild.id);
  if (!wrapper || !wrapper.player.connected) return;
  const channel = newState.guild.channels.cache.get(
    wrapper.player.voiceChannelId
  );
  if (!channel || !(channel.members instanceof Collection)) return;
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
  console.error(
    `Node ${node.identifier || node.host} encountered an error:`,
    error
  );
});

bot.manager.on("trackStart", (player, track) => {
  if (player.loop === "track") return;
  const channel = bot.channels.cache.get(player.textChannelId);
  const { name, avatar } = track.requestedBy as {
    id: string;
    name: string;
    avatar: string;
  };
  if (channel && channel.isSendable()) {
    const embed = new EmbedBuilder()
      .setColor("#0067a3")
      .setTitle(":arrow_forward: 노래를 재생할게요")
      .setDescription(
        `[\`${track.title}\`](<${track.url}>) (${timeString(track.duration / 1000)})`
      )
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
  if (!wrapper) return;
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
