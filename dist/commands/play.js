"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const search_1 = require("../modules/search");
const types_1 = require("../types");
const ytdl_core_1 = require("ytdl-core");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder()
    .setName("재생")
    .setDescription("노래를 재생합니다.")
    .addStringOption((option) => option.setName("제목").setDescription("제목을 입력하세요.").setRequired(true)), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("음성 채널에 참가하세요!");
    let keyword = interaction.options.getString("제목");
    if (!keyword)
        return await interaction.editReply("오류가 발생하였습니다! 로그를 참조하세요.");
    const result = await (0, search_1.search)(keyword, 1);
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
    let lastSong = guildQueue.songs[guildQueue.songs.length - 1];
    await interaction.editReply({
        embeds: [
            new discord_js_1.MessageEmbed()
                .setColor("#008000")
                .setTitle(":white_check_mark: 곡을 추가했어요")
                .setDescription(`[${lastSong.title}](${lastSong.url}) (${lastSong.duration > 59 ? Math.floor(lastSong.duration / 60) : "0"}:${String(lastSong.duration % 60).padStart(2, "0")})`)
                .setThumbnail(lastSong.thumbnail),
        ],
    });
    if (!guildQueue.isPlaying) {
        await guildQueue.play(guildQueue.songs[0]);
    }
});
