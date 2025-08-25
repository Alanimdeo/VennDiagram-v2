import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Bot, Command } from "../types";

export default new Command(
  new SlashCommandBuilder()
    .setName("반복")
    .setDescription("반복 유형을 설정합니다.")
    .addStringOption((option) =>
      option
        .setName("유형")
        .setDescription("반복 유형을 선택하세요.")
        .addChoices(
          { name: "없음", value: "off" },
          { name: "곡", value: "track" },
          { name: "전체", value: "queue" }
        )
        .setRequired(true)
    ),
  async (interaction: ChatInputCommandInteraction, bot: Bot) => {
    await interaction.deferReply();

    const author = interaction.member as GuildMember;
    if (!author.voice.channel)
      return await interaction.editReply("먼저 음성 채널에 참가하세요.");

    const player = bot.manager.players.get(interaction.guildId!);
    if (!player)
      return await interaction.editReply("재생 목록에 노래가 없어요.");

    if (author.voice.channel.id !== player.voiceChannelId)
      return await interaction.editReply("봇과 같은 음성 채널에 참가하세요.");

    const repeatMode = interaction.options.getString("유형", true);
    if (!["off", "track", "queue"].includes(repeatMode)) {
      return await interaction.editReply("올바른 반복 유형을 선택하세요.");
    }

    player.setLoop(repeatMode as "off" | "track" | "queue");
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#008000")
          .setTitle(
            `:${repeatMode === "off" ? "arrow_right" : repeatMode === "track" ? "repeat_one" : "repeat"}: ${
              repeatMode === "off"
                ? "반복을 껐어요"
                : "반복 유형을 " +
                  (repeatMode == "track" ? "곡으로" : "전체로") +
                  " 설정했어요"
            }`
          ),
      ],
    });
  }
);
