import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot, Command, Song } from "../types";

module.exports = new Command(
    new SlashCommandBuilder().setName("목록").setDescription("재생 목록을 확인합니다."),
    async (interaction: CommandInteraction, bot: Bot) => {
        let message = `:scroll: ${interaction.guild?.name} 서버의 재생 목록`;
        let guildQueue = bot.player.queue.get(interaction.guildId ? interaction.guildId : "");
        if (guildQueue) {
            let length = String(guildQueue.songs.length).length;
            guildQueue.songs.forEach((song: Song, index: number) => {
                message += `\n\`${String(index + 1).padStart(length, "0")}. ${song.title} (${song.duration})\``;
            });
        } else message += "이 없습니다.";
        await interaction.reply(message);
    }
);
