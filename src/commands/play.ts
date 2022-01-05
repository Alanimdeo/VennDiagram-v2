import { CommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { search } from "../modules/search";
import { Bot, Command, Queue, Song } from "../types";
import { getInfo } from "ytdl-core";

module.exports = new Command(
    new SlashCommandBuilder()
        .setName("재생")
        .setDescription("노래를 재생합니다.")
        .addStringOption((option) => option.setName("제목").setDescription("제목을 입력하세요.").setRequired(false)),
    async (interaction: CommandInteraction, bot: Bot) => {
        await interaction.deferReply();
        let author: GuildMember = interaction.member as GuildMember;
        if (!author.voice.channel) return await interaction.editReply("음성 채널에 참가하세요!");
        let keyword = interaction.options.getString("제목");
        if (!keyword) return await interaction.editReply("error");
        const result = await search(keyword, 1);
        await interaction.editReply("결과:");
        result.forEach(async (video) => {
            if (interaction.channel) await interaction.channel.send(video.type === "video" ? video.title : "오류");
        });
        let song = result[0];
        if (song.type !== "video" || !interaction.guildId || !interaction.channel || !interaction.member) return;
        let guildQueue = bot.player.queue.get(interaction.guildId);
        if (!guildQueue) {
            bot.player.queue.set(interaction.guildId, new Queue(interaction.channel, author.voice.channel));
            guildQueue = bot.player.queue.get(interaction.guildId);
        }
        if (!guildQueue) return;
        guildQueue.songs.push(new Song(await getInfo(song.url), interaction.member as GuildMember));
        if (!guildQueue.isPlaying) {
            await guildQueue.play(guildQueue.songs[0].url);
        }
    }
);
