import { SlashCommandBuilder } from "@discordjs/builders";
import { Guild } from "discord.js";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("serverlist").setDescription("서버 목록"),
  async (message: string[], bot: Bot) => {
    let guilds = bot.guilds.cache;
    let guildList = "서버 목록:\n";
    guilds.map((guild: Guild) => {
      guildList += `${guild.name}(${guild.id})\n`;
    });
    return guildList + `\n자세한 정보를 확인하려면, "serverinfo <서버ID>" 명령어를 사용하세요.`;
  }
);
