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
      return await interaction.editReply("음성 채널에 참가하세요!");
    let guildQueue = bot.player.queue.get(
      interaction.guildId ? interaction.guildId : ""
    );
    if (!guildQueue || guildQueue.songs.length === 0)
      return await interaction.editReply("재생 목록에 노래가 없어요.");
    guildQueue.songs.shift();
    if (guildQueue.songs.length !== 0) guildQueue.play(guildQueue.songs[0]);
    else guildQueue.audioPlayer.stop();
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor("#008000")
          .setTitle(":fast_forward: 곡을 스킵했어요"),
      ],
    });
  }
);
