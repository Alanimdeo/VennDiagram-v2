console.log("모듈 불러오는 중...");
import { Collection, GatewayIntentBits, Interaction, InteractionType, Message, VoiceState } from "discord.js";
import { readdirSync } from "fs";
import { createInterface } from "readline";
import { Bot, Command } from "./types";
import config from "./config";

console.log("봇 생성 중...");
const bot: Bot = new Bot({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent, // 테스트로 추가해봄. 얘 때문에 awaitMessages가 작동 안 했던 건가?
  ],
});

const commands = readdirSync("./commands").filter((file: string) => file.endsWith(".js") || file.endsWith(".ts"));
for (const file of commands) {
  const command: Command = require(`./commands/${file}`);
  console.log(`명령어 불러오는 중.. (${command.data.name})`);
  bot.commands.set(command.data.name, command);
}

const adminCommands = readdirSync("./adminCommands").filter(
  (file: string) => file.endsWith(".js") || file.endsWith(".ts")
);
for (const file of adminCommands) {
  const command: Command = require(`./adminCommands/${file}`);
  console.log(`관리자 명령어 불러오는 중.. (${command.data.description})`);
  bot.adminCommands.set(command.data.name, command);
}

bot.once("ready", () => {
  console.log(`준비 완료! 토큰: \x1b[32m${config.token}\x1b[0m`);
});

bot.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.type !== InteractionType.ApplicationCommand) return;

  const command = bot.commands.get(interaction.commandName);
  if (!command) return;

  bot.lastInteraction = interaction;

  await command.execute(interaction, bot);
});

bot.on("messageCreate", async (message: Message) => {
  if (!message.content.startsWith(config.adminPrefix) || !config.admins.includes(message.author.id)) return;

  const command = bot.adminCommands.get(message.content.split(" ")[1]);
  if (!command) return;

  await command.execute(message, bot);
});

bot.on("voiceStateUpdate", (_, newState: VoiceState) => {
  const guildQueue = bot.player.queue.get(newState.guild.id);
  if (!guildQueue || !guildQueue.connection.joinConfig.channelId) return;
  const channel = newState.guild.channels.cache.get(guildQueue.connection.joinConfig.channelId);
  if (!channel || !(channel.members instanceof Collection)) return;
  const members = Array.from(channel.members.keys());
  if (members.length === 1 || !bot.user || !members.includes(bot.user.id)) {
    guildQueue.audioPlayer.stop(true);
    guildQueue.connection.destroy();
    bot.player.queue.delete(newState.guild.id);
  }
});

const consoleCommands = readdirSync("./consoleCommands").filter(
  (file: string) => file.endsWith(".js") || file.endsWith(".ts")
);
for (const file of consoleCommands) {
  const command: Command = require(`./consoleCommands/${file}`);
  console.log(`콘솔 명령어 불러오는 중.. (${command.data.description})`);
  bot.consoleCommands.set(command.data.name, command);
}

const consoleCompletion = bot.consoleCommands.map((command: Command) => command.data.name);

const consoleInput = createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: (line: string) => {
    const hits = consoleCompletion.filter((c) => c.startsWith(line));
    return [hits.length ? hits : consoleCompletion, line];
  },
});

consoleInput.on("line", async (line: string) => {
  try {
    const commandLine = line.split(" ");
    if (commandLine.length === 0 || commandLine === undefined) return;
    const command = bot.consoleCommands.get(commandLine.shift() as string);
    if (command) {
      const result = await command.execute(commandLine, bot);
      if (result) {
        console.log(result);
      }
    } else {
      console.log(eval(line));
    }
  } catch (err) {
    console.error(err);
  }
});

console.log("로그인 중...");
bot.login(config.token);

const exit = (require("./consoleCommands/exit") as Command).execute;
process.on("SIGINT", async () => {
  await exit([], bot);
});
process.on("SIGTERM", async () => {
  await exit([], bot);
});
process.on("SIGTERM", async () => {
  await exit([], bot);
});
