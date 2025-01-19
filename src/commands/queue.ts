import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Song } from "../modules/song";
import { Bot, Command } from "../types";
import { convertSecondsToTime } from "../modules/time";

export default new Command(
  new SlashCommandBuilder()
    .setName("목록")
    .setDescription("재생 목록을 확인합니다."),
  async (interaction: ChatInputCommandInteraction, bot: Bot) => {
    await interaction.deferReply();
    let message = "";
    let guildQueue = bot.player.queue.get(interaction.guildId || "");
    if (guildQueue && guildQueue.songs.length !== 0) {
      let length = String(guildQueue.songs.length).length;
      guildQueue.songs.map((song: Song, index: number) => {
        message += `\n${index === 0 ? (guildQueue?.isPlaying ? ":arrow_forward:" : ":pause_button:") : ""}\`${String(
          index + 1
        ).padStart(length, "0")}. [\`${song.title}\`](<${song.url}>) (`;
        if (song.startFrom !== 0)
          message += `${convertSecondsToTime(song.startFrom)} ~ `;
        message += `${song.duration})\``;
      });
    } else
      message +=
        ".노래가 없어요. `/재생 (노래 제목 또는 유튜브 링크)` 명령어를 통해 노래를 틀어 보세요!";
    const repeatMode = guildQueue
      ? " (반복 모드: " +
        (guildQueue.repeatMode === "none"
          ? "없음"
          : guildQueue.repeatMode === "song"
            ? "곡"
            : "전체") +
        ")"
      : "";
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#0067a3")
          .setTitle(
            `:scroll: ${interaction.guild?.name}의 재생 목록${repeatMode}`
          )
          .setDescription(message.slice(1)),
      ],
    });
  }
);
