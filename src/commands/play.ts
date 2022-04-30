import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getInfo } from "ytdl-core";
import { search } from "../modules/search";
import { Song } from "../modules/song";
import { Queue } from "../modules/player";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder()
    .setName("재생")
    .setDescription("노래를 재생합니다.")
    .addStringOption((option) => option.setName("제목").setDescription("제목을 입력하세요.").setRequired(true)),
  async (interaction: CommandInteraction, bot: Bot) => {
    await interaction.deferReply();
    let author: GuildMember = interaction.member as GuildMember;
    if (!author.voice.channel) return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    let keyword = interaction.options.getString("제목");
    if (!keyword) return await interaction.editReply("오류가 발생하였습니다! 로그를 참조하세요.");
    let song = undefined;
    if (/(http|https):\/\/(youtu\.be\/|(www\.|)youtube\.com\/watch\?(v|vi)=)[A-Za-z0-9_\-]+/.test(keyword)) {
      try {
        song = await getInfo(keyword);
      } catch (err) {
        await interaction.editReply("존재하지 않는 영상이에요. 링크를 다시 확인해 주세요.");
        return;
      }
    } else {
      const result = await search(keyword).catch(async () => {
        return [];
      });
      if (!result || result.length === 0 || result[0].type != "video") {
        await interaction.editReply("검색 결과가 없어요.");
        return;
      }
      song = await getInfo(result[0].url);
    }
    if (!song || !interaction.guildId || !interaction.channel || !interaction.member)
      return await interaction.editReply("검색 결과가 없어요.");
    let guildQueue = bot.player.queue.get(interaction.guildId);
    if (!guildQueue) {
      bot.player.queue.set(interaction.guildId, new Queue(interaction.channel, author.voice.channel, bot));
      guildQueue = bot.player.queue.get(interaction.guildId);
    }
    if (!guildQueue) return;
    guildQueue.songs.push(new Song(song, interaction.member as GuildMember));
    let lastSong = guildQueue.songs[guildQueue.songs.length - 1];
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setColor("#008000")
          .setTitle(":white_check_mark: 곡을 추가했어요")
          .setDescription(`[${lastSong.title}](${lastSong.url}) (${lastSong.duration})`)
          .setThumbnail(lastSong.thumbnail),
      ],
    });
    if (!guildQueue.isPlaying) {
      await guildQueue.play(guildQueue.songs[0]);
    }
  }
);
