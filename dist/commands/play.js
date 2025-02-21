"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ytdl_core_1 = require("@distube/ytdl-core");
const search_1 = require("../modules/search");
const song_1 = require("../modules/song");
const player_1 = require("../modules/player");
const time_1 = require("../modules/time");
const types_1 = require("../types");
exports.default = new types_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("재생")
    .setDescription("노래를 재생합니다.")
    .addStringOption((option) => option
    .setName("제목")
    .setDescription("제목을 입력하세요.")
    .setRequired(true)), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    let keyword = interaction.options.getString("제목", true);
    let song;
    let startFrom = 0;
    if (/((http|https):\/\/)?(youtu\.be\/(shorts\/)?|(www\.)?youtube\.com\/((watch\?(v|vi)=)|(shorts\/)))[A-Za-z0-9_\-]+((\?|&)t=[0-9]+(s)?)?/.test(keyword)) {
        try {
            song = await (0, ytdl_core_1.getInfo)(keyword);
        }
        catch (err) {
            await interaction.editReply("존재하지 않는 영상이에요. 링크를 다시 확인해 주세요.");
            return;
        }
        if (/(\?|&)t=[0-9]+(s)?/.test(keyword)) {
            await interaction.editReply("시간이 지정되어 있어요. 어떻게 할까요?\n\n1: 처음부터 재생\n2: 지정된 시간부터 재생");
            const message = await interaction.channel?.awaitMessages({
                filter: async (message) => {
                    if (message.author.id === interaction.member.id &&
                        message.channelId == interaction.channelId) {
                        await message.delete();
                        return true;
                    }
                    else {
                        return false;
                    }
                },
                max: 1,
                time: 30000,
                errors: ["time"],
            });
            if (!message || !message.first()) {
                await interaction.editReply("시간이 초과되었어요. 30초 내에 번호를 입력해 주세요.");
                return;
            }
            const choice = message.first()?.content;
            if (choice === "1") {
                startFrom = 0;
            }
            else if (choice === "2") {
                startFrom = Number(/(\?|&)t=([0-9]+)(s)?/.exec(keyword)[2]);
            }
            else {
                await interaction.editReply("1 또는 2만 입력해 주세요.");
                return;
            }
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
    if (!song ||
        !interaction.guildId ||
        !interaction.channel ||
        !interaction.member) {
        return await interaction.editReply("검색 결과가 없어요.");
    }
    if (Array.isArray(song)) {
        try {
            song = await (0, search_1.makeChoice)(song, interaction);
        }
        catch (err) {
            let message = "";
            if (err instanceof Error && err.message === "Cancel") {
                await interaction.deleteReply();
                return;
            }
            if (err instanceof Error) {
                switch (err.message) {
                    case "Timeout":
                        message = "시간이 초과되었어요. 30초 내에 번호를 입력해 주세요.";
                        break;
                    case "invalidChoice":
                        message = "1~5 사이의 숫자만 입력해 주세요.";
                        break;
                    case "invalidResult":
                        message = "곡 정보를 받아올 수 없어요. 다시 시도해 주세요.";
                        break;
                    default:
                        console.error(err);
                        message = "알 수 없는 오류입니다. 개발자에게 문의하세요.";
                        break;
                }
            }
            else {
                console.error(err);
                message = "알 수 없는 오류입니다. 개발자에게 문의하세요.";
            }
            return await interaction.editReply({
                content: message,
                components: [],
            });
        }
    }
    let guildQueue = bot.player.queue.get(interaction.guildId);
    if (!guildQueue) {
        bot.player.queue.set(interaction.guildId, new player_1.Queue(interaction.channel, author.voice.channel, bot));
        guildQueue = bot.player.queue.get(interaction.guildId);
    }
    if (!guildQueue)
        return;
    const newSong = new song_1.Song(song, startFrom, interaction.member);
    guildQueue.songs.push(newSong);
    const embeds = [
        new discord_js_1.EmbedBuilder()
            .setColor("#008000")
            .setTitle(":white_check_mark: 곡을 추가했어요")
            .setDescription(`[\`${newSong.title}\`](<${newSong.url}>) (${newSong.duration})`)
            .setThumbnail(newSong.thumbnail),
    ];
    if (startFrom > 0) {
        embeds[0].setFooter({
            text: `시작 위치: ${(0, time_1.convertSecondsToTime)(startFrom)}`,
        });
    }
    await interaction.editReply({
        content: null,
        embeds,
    });
    if (!guildQueue.isPlaying) {
        await guildQueue.play(guildQueue.songs[0]);
    }
});
