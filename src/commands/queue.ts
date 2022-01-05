import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Bot, Command, Song } from "../types";

module.exports = new Command(
    new SlashCommandBuilder().setName("목록").setDescription("재생 목록을 확인합니다."),
    async (interaction: CommandInteraction, bot: Bot) => {
        let message = "";
        let guildQueue = bot.player.queue.get(interaction.guildId ? interaction.guildId : "");
        if (guildQueue) {
            let length = guildQueue.songs.length - 1;
            guildQueue.songs.forEach(async (song: Song, index: number) => {
                message += `\n${index != length ? "├" : "⎿"} ${song.title} (${song.duration})`;
            });
        }
        await interaction.reply(`:scroll: ${interaction.guild?.name} 서버의 재생 목록${message}`);
    }
);
