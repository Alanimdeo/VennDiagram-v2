import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("exit").setDescription("종료"),
  async (message: string[], bot: Bot) => {
    process.exit();
  }
);
