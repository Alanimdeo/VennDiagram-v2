"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const ytdl_core_1 = require("ytdl-core");
const search_1 = require("../modules/search");
const song_1 = require("../modules/song");
const player_1 = require("../modules/player");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder()
    .setName("재생")
    .setDescription("노래를 재생합니다.")
    .addStringOption((option) => option.setName("제목").setDescription("제목을 입력하세요.").setRequired(true)), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    let keyword = interaction.options.getString("제목");
    if (!keyword)
        return await interaction.editReply("오류가 발생하였습니다! 로그를 참조하세요.");
    let song = undefined;
    if (/(http|https):\/\/(youtu\.be\/|(www\.|)youtube\.com\/watch\?(v|vi)=)[A-Za-z0-9_\-]+/.test(keyword)) {
        try {
            song = await (0, ytdl_core_1.getInfo)(keyword);
        }
        catch (err) {
            await interaction.editReply("존재하지 않는 영상이에요. 링크를 다시 확인해 주세요.");
            return;
        }
    }
    else {
        const result = await (0, search_1.search)(keyword).catch(async () => {
            return [];
        });
        if (!result || result.length === 0 || result[0].type != "video") {
            await interaction.editReply("검색 결과가 없어요.");
            return;
        }
        song = result;
    }
    if (!song || !interaction.guildId || !interaction.channel || !interaction.member)
        return await interaction.editReply("검색 결과가 없어요.");
    if (song instanceof Array) {
        try {
            song = await (0, search_1.makeChoice)(song, interaction, bot);
        }
        catch (err) {
            let message = "";
            if (err instanceof Error) {
                if (err.message === "Timeout") {
                    message = "시간이 초과되었어요. 30초 내에 번호를 입력해 주세요.";
                }
                else if (err.message === "invalidChoice") {
                    message = "1~5 사이의 숫자만 입력해 주세요.";
                }
                else if (err.message === "invalidResult") {
                    message = "곡 정보를 받아올 수 없어요. 다시 시도해 주세요.";
                }
            }
            else {
                message = "알 수 없는 오류입니다. 개발자에게 문의하세요.";
            }
            return await interaction.editReply(message);
        }
    }
    let guildQueue = bot.player.queue.get(interaction.guildId);
    if (!guildQueue) {
        bot.player.queue.set(interaction.guildId, new player_1.Queue(interaction.channel, author.voice.channel, bot));
        guildQueue = bot.player.queue.get(interaction.guildId);
    }
    if (!guildQueue)
        return;
    guildQueue.songs.push(new song_1.Song(song, interaction.member));
    let lastSong = guildQueue.songs[guildQueue.songs.length - 1];
    await interaction.editReply({
        content: null,
        embeds: [
            new discord_js_1.MessageEmbed()
                .setColor("#008000")
                .setTitle(":white_check_mark: 곡을 추가했어요")
                .setDescription(`[${lastSong.title}](${lastSong.url}) (${lastSong.duration})`)
                .setThumbnail(lastSong.thumbnail),
        ],
    });
    if (!guildQueue.isPlaying) {
        await guildQueue.play(guildQueue.songs[0]);
    }
});
