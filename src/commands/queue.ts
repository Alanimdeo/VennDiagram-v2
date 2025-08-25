import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Bot, Command } from "../types";
import { timeString } from "../modules/time";

export default new Command(
  new SlashCommandBuilder()
    .setName("목록")
    .setDescription("재생 목록을 확인합니다."),
  async (interaction: ChatInputCommandInteraction, bot: Bot) => {
    await interaction.deferReply();

    let message = "";
    const player = bot.manager.players.get(interaction.guildId!);
    if (player && (player.playing || player.queue.size !== 0)) {
      message +=
        (player.paused ? ":pause_button:" : ":arrow_forward:") +
        `[\`${player.current.title}\`](<${player.current.url}>) (${timeString(player.current.duration / 1000)})`;
      let length = String(player.queue.size).length;
      player.queue.tracks.slice(0, 10).map((track, index) => {
        message += `\n\`${String(index + 1).padStart(
          length,
          "0"
        )}\`. [\`${track.title}\`](<${track.url}>) (${timeString(track.duration / 1000)})`;
      });
      if (player.queue.size > 10) {
        message += `\n...외 ${player.queue.size - 10}곡`;
      }
    } else
      message +=
        "노래가 없어요. `/재생 (노래 제목 또는 유튜브 링크)` 명령어를 통해 노래를 틀어 보세요!";
    let title = `:scroll: ${interaction.guild?.name}의 재생 목록`;
    if (player && player.loop !== "off") {
      if (player.loop === "track") {
        title += " (:repeat_one: 1곡 반복 중)";
      } else {
        title += " (:repeat: 전체 반복 중)";
      }
    }
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#0067a3")
          .setTitle(title)
          .setDescription(message),
      ],
    });
  }
);
