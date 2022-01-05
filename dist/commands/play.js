"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const search_1 = require("../modules/search");
const types_1 = require("../types");
const ytdl_core_1 = require("ytdl-core");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder()
    .setName("재생")
    .setDescription("노래를 재생합니다.")
    .addStringOption((option) => option.setName("제목").setDescription("제목을 입력하세요.").setRequired(false)), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("음성 채널에 참가하세요!");
    let keyword = interaction.options.getString("제목");
    if (!keyword)
        return await interaction.editReply("error");
    const result = await (0, search_1.search)(keyword, 1);
    await interaction.editReply("결과:");
    result.forEach(async (video) => {
        if (interaction.channel)
            await interaction.channel.send(video.type === "video" ? video.title : "오류");
    });
    let song = result[0];
    if (song.type !== "video" || !interaction.guildId || !interaction.channel || !interaction.member)
        return;
    let guildQueue = bot.player.queue.get(interaction.guildId);
    if (!guildQueue) {
        bot.player.queue.set(interaction.guildId, new types_1.Queue(interaction.channel, author.voice.channel));
        guildQueue = bot.player.queue.get(interaction.guildId);
    }
    if (!guildQueue)
        return;
    guildQueue.songs.push(new types_1.Song(await (0, ytdl_core_1.getInfo)(song.url), interaction.member));
    if (!guildQueue.isPlaying) {
        await guildQueue.play(guildQueue.songs[0].url);
    }
});
