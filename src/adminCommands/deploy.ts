import { ApplicationCommandDataResolvable, Message, SlashCommandBuilder } from "discord.js";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("deploy").setDescription("설치"),
  async (message: Message, bot: Bot) => {
    const guildCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
    bot.commands.map((command: Command) =>
      guildCommands.push(command.data.toJSON() as RESTPostAPIApplicationCommandsJSONBody)
    );
    if (!message.guild) return;
    await message.guild.commands.set(guildCommands as ApplicationCommandDataResolvable[]);
    await message.reply(
      `Complete! Commands(${guildCommands.length}): ${guildCommands
        .map((command: RESTPostAPIApplicationCommandsJSONBody) => command.name)
        .toString()
        .replaceAll(",", ", ")}`
    );
  }
);
