import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Bot, Command } from "../types";

export default new Command(
  new SlashCommandBuilder()
    .setName("삭제")
    .setDescription(
      "대기열에서 노래를 삭제합니다. 재생 중인 노래를 스킵하려면 /다음 명령어를 사용하세요."
    )
    .addIntegerOption((option) =>
      option
        .setName("번호")
        .setDescription("삭제할 노래의 번호를 입력하세요.")
        .setRequired(true)
    ),
  async (interaction: ChatInputCommandInteraction, bot: Bot) => {
    await interaction.deferReply();
    let author: GuildMember = interaction.member as GuildMember;
    if (!author.voice.channel || !interaction.guildId)
      return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    const player = bot.manager.players.get(interaction.guildId!);
    if (!player || player.queue.size === 0)
      return await interaction.editReply("대기열에 노래가 없어요.");
    let removeNumber = interaction.options.getInteger("번호", true);
    if (removeNumber <= 0 || removeNumber > player.queue.size)
      return await interaction.editReply("선택한 번호가 없어요.");
    player.queue.remove(removeNumber - 1);
    await interaction.editReply({
      embeds: [
        new EmbedBuilder().setColor("#008000").setTitle(":x: 곡을 삭제했어요"),
      ],
    });
  }
);
