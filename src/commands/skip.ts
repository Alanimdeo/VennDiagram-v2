import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { Bot, Command } from "../types";

export default new Command(
  new SlashCommandBuilder()
    .setName("다음")
    .setDescription("다음 곡을 재생합니다."),
  async (interaction: ChatInputCommandInteraction, bot: Bot) => {
    await interaction.deferReply();
    let author: GuildMember = interaction.member as GuildMember;
    if (!author.voice.channel)
      return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    const player = bot.manager.players.get(interaction.guildId!);
    if (!player || !player.current) {
      return await interaction.editReply("현재 재생 중인 노래가 없어요.");
    }

    if (player.queue.size > 0) {
      player.skip();
    } else {
      player.setLoop("off");
      player.stop();
    }
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#008000")
          .setTitle(":fast_forward: 곡을 스킵했어요"),
      ],
    });
  }
);
