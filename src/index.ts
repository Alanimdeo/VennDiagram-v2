console.log("모듈 불러오는 중...");
const config = require("./config.json");
import { Intents, Interaction, Message } from "discord.js";
import { readdirSync } from "fs";
import { Bot, Command } from "./types";

const bot: Bot = new Bot({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
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
    console.log(`로그인 완료! 토큰: \x1b[32m${config.token}\x1b[0m\n준비 완료!`);
});

bot.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const command = bot.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction, bot);
});

bot.on("messageCreate", async (message: Message) => {
    if (!message.content.startsWith(config.adminPrefix)) return;

    const command = bot.adminCommands.get(message.content.split(" ")[1]);
    if (!command) return;

    await command.execute(message, bot);
});

bot.login(config.token);
