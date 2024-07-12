import { Message, SlashCommandBuilder } from "discord.js";
import { Bot, Command } from "../types";

export default new Command(
  new SlashCommandBuilder().setName("eval").setDescription("명령 실행"),
  async (message: Message, bot: Bot) => {
    try {
      let command = message.content.split(" ");
      command.shift();
      command.shift();
      let result = eval(command.join(" "));
      if (typeof result === "object")
        result = JSON.stringify(result, undefined, 2);
      message.reply("```" + String(result) + "```");
    } catch (err) {
      message.reply("```" + String(err) + "```");
      console.error(err);
    }
  }
);
