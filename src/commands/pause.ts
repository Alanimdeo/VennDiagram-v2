import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Bot, Command } from "../types";

export default new Command(
  new SlashCommandBuilder()
    .setName("일시정지")
    .setDescription("음악을 일시정지합니다.")
    .addNumberOption((option) =>
      option
        .setName("시간")
        .setDescription(
          "일시정지할 시간을 입력하세요. 0.5초부터 입력할 수 있어요."
        )
        .setMinValue(0.5)
        .setRequired(false)
    ),
  async (interaction: ChatInputCommandInteraction, bot: Bot) => {
    await interaction.deferReply();
    let author: GuildMember = interaction.member as GuildMember;
    if (!author.voice.channel || !interaction.guildId)
      return await interaction.editReply("먼저 음성 채널에 참가하세요.");

    const player = bot.manager.players.get(interaction.guildId!);
    if (!player) {
      return interaction.editReply("There is nothing playing in this server!");
    }

    if (player.paused) {
      player.resume();
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ffff00")
            .setTitle(":arrow_forward: 일시정지를 해제했어요"),
        ],
      });
    }

    player.pause();
    let duration = interaction.options.getNumber("시간", false);
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#ffff00")
          .setTitle(
            `:pause_button: 노래를 ${duration ? duration + "초 동안 " : ""}일시정지했어요`
          )
          .setDescription(
            "`/일시정지` 명령어를 다시 입력하면 재생할 수 있어요."
          ),
      ],
    });
    if (duration) {
      setTimeout(
        async () => {
          if (player.paused) {
            player.resume();
          }
        },
        Number(duration) * 1000
      );
    }
  }
);
