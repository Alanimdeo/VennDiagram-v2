import { Message } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("eval").setDescription("명령 실행"),
  async (message: Message, bot: Bot) => {
    try {
      let command = message.content.split(" ");
      command.shift();
      command.shift();
      let result = eval(command.join(" "));
      if (typeof result === "object") result = JSON.stringify(result, undefined, 2);
      message.reply("```" + String(result) + "```");
    } catch (err) {
      message.reply("```" + String(err) + "```");
      console.error(err);
    }
  }
);
