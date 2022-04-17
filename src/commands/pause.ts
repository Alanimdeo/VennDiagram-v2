import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder()
    .setName("일시정지")
    .setDescription("음악을 일시정지합니다.")
    .addNumberOption((option) =>
      option
        .setName("시간")
        .setDescription("일시정지할 시간을 입력하세요. 0.5초부터 입력할 수 있어요.")
        .setMinValue(0.5)
        .setRequired(false)
    ),
  async (interaction: CommandInteraction, bot: Bot) => {
    await interaction.deferReply();
    let author: GuildMember = interaction.member as GuildMember;
    if (!author.voice.channel || !interaction.guildId)
      return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    let guildQueue = bot.player.queue.get(interaction.guildId);
    if (!guildQueue || guildQueue.songs.length === 0) return await interaction.editReply("재생 목록에 노래가 없어요.");
    if (guildQueue.isPlaying) {
      guildQueue.isPlaying = false;
      guildQueue.audioPlayer.pause();
      let duration = interaction.options.getNumber("시간");
      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor("#ffff00")
            .setTitle(`:pause_button: 노래를 ${duration ? duration + "초 동안 " : ""}일시정지했어요`)
            .setDescription("`/일시정지` 명령어를 다시 입력하면 재생할 수 있어요."),
        ],
      });
      if (duration) {
        setTimeout(async () => {
          if (guildQueue && !guildQueue.isPlaying) {
            guildQueue.isPlaying = true;
            guildQueue.audioPlayer.unpause();
          }
        }, duration * 1000);
      }
    } else {
      guildQueue.isPlaying = true;
      guildQueue.audioPlayer.unpause();
      await interaction.editReply({
        embeds: [new MessageEmbed().setColor("#ffff00").setTitle(":arrow_forward: 일시정지를 해제했어요")],
      });
    }
  }
);
