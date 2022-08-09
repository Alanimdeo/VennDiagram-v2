import { CommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder()
    .setName("삭제")
    .setDescription("재생 목록에서 노래를 삭제합니다. 첫 번째 노래를 삭제할 경우, 재생 중이던 노래가 스킵됩니다.")
    .addIntegerOption((option) =>
      option.setName("번호").setDescription("삭제할 노래의 번호를 입력하세요.").setRequired(true)
    ),
  async (interaction: CommandInteraction, bot: Bot) => {
    await interaction.deferReply();
    let author: GuildMember = interaction.member as GuildMember;
    if (!author.voice.channel || !interaction.guildId)
      return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    let guildQueue = bot.player.queue.get(interaction.guildId);
    if (!guildQueue || guildQueue.songs.length === 0) return await interaction.editReply("재생 목록에 노래가 없어요.");
    let removeNumber = Number(interaction.options.get("번호", true).value);
    if (removeNumber - 1 > guildQueue.songs.length) return await interaction.editReply("선택한 번호가 없어요.");
    guildQueue.songs.splice(removeNumber - 1, 1);
    if (removeNumber === 1 && guildQueue.songs.length !== 0) guildQueue.play(guildQueue.songs[0]);
    else if (guildQueue.songs.length === 0) {
      guildQueue.audioPlayer.stop();
    }
    await interaction.editReply({
      embeds: [new EmbedBuilder().setColor("#008000").setTitle(":x: 곡을 삭제했어요")],
    });
  }
);
