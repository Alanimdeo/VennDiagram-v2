import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
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
      embeds: [new MessageEmbed({ color: "#008000", title: ":eject: 음성 채널에서 퇴장했어요" })],
    });
  }
);
