import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("clear").setDescription("콘솔 초기화"),
  async (message: string[], bot: Bot) => {
    console.clear();
    return null;
  }
);
