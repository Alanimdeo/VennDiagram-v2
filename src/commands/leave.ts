import { CommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("퇴장").setDescription("봇을 음성 채널에서 퇴장시킵니다."),
  async (interaction: CommandInteraction, bot: Bot) => {
    await interaction.deferReply();
    let author = interaction.member as GuildMember;
    if (!author.voice.channel) return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    if (!interaction.guildId) return;
    let guildQueue = bot.player.queue.get(interaction.guildId);
    if (!guildQueue) return await interaction.editReply("봇이 음성 채널에 참가 중이지 않아요.");
    guildQueue.audioPlayer.stop(true);
    guildQueue.connection.destroy();
    bot.player.queue.delete(interaction.guildId);
    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor("#008000").setTitle(":eject: 음성 채널에서 퇴장했어요")],
    });
  }
);
