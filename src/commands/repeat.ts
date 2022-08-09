import { CommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder()
    .setName("반복")
    .setDescription("반복 유형을 설정합니다.")
    .addStringOption((option) =>
      option
        .setName("유형")
        .setDescription("반복 유형을 선택하세요.")
        .addChoices({ name: "없음", value: "none" }, { name: "곡", value: "song" }, { name: "전체", value: "all" })
        .setRequired(true)
    ),
  async (interaction: CommandInteraction, bot: Bot) => {
    await interaction.deferReply();
    let author = interaction.member as GuildMember;
    if (!author.voice.channel) return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    let guildQueue = bot.player.queue.get(interaction.guildId || "");
    if (!guildQueue) return await interaction.editReply("재생 목록에 노래가 없어요.");
    let repeatMode = String(interaction.options.get("유형", true).value);
    if (!(repeatMode === "none" || repeatMode === "song" || repeatMode === "all"))
      return await interaction.editReply("유형을 선택하세요.");
    guildQueue.repeatMode = repeatMode;
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#008000")
          .setTitle(
            `:${repeatMode === "none" ? "arrow_right" : repeatMode === "song" ? "repeat_one" : "repeat"}: ${
              repeatMode === "none"
                ? "반복을 껐어요"
                : "반복 유형을 " + (repeatMode == "song" ? "곡으로" : "전체로") + " 설정했어요"
            }`
          ),
      ],
    });
  }
);
