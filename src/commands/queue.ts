import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Bot, Command, Song } from "../types";

module.exports = new Command(
    new SlashCommandBuilder().setName("목록").setDescription("재생 목록을 확인합니다."),
    async (interaction: CommandInteraction, bot: Bot) => {
        await interaction.deferReply();
        let message = "";
        let guildQueue = bot.player.queue.get(interaction.guildId ? interaction.guildId : "");
        if (guildQueue) {
            let length = String(guildQueue.songs.length).length;
            guildQueue.songs.forEach((song: Song, index: number) => {
                message += `\n\`${String(index + 1).padStart(length, "0")}. ${song.title} (${song.duration})\``;
            });
        } else message += "..노래가 없어요. `/재생 (노래 제목 또는 유튜브 링크)` 명령어를 통해 노래를 틀어 보세요!";
        await interaction.editReply({
            embeds: [
                new MessageEmbed({
                    color: "#0067a3",
                    title: `:scroll: ${interaction.guild?.name} 서버의 재생 목록`,
                    description: message.slice(2),
                }),
            ],
        });
    }
);
