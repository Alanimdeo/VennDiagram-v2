"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder()
    .setName("반복")
    .setDescription("반복 유형을 설정합니다.")
    .addStringOption((option) => option
    .setName("유형")
    .setDescription("반복 유형을 선택하세요.")
    .addChoices([
    ["없음", "none"],
    ["곡", "song"],
    ["전체", "all"],
])
    .setRequired(true)), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    let guildQueue = bot.player.queue.get(interaction.guildId || "");
    if (!guildQueue)
        return await interaction.editReply("재생 목록에 노래가 없어요.");
    let repeatMode = interaction.options.getString("유형");
    if (!repeatMode || !(repeatMode === "none" || repeatMode === "song" || repeatMode === "all"))
        return await interaction.editReply("유형을 선택하세요.");
    guildQueue.repeatMode = repeatMode;
    await interaction.editReply({
        embeds: [
            new discord_js_1.MessageEmbed({
                color: "#008000",
                title: `:${repeatMode === "none" ? "arrow_right" : repeatMode === "song" ? "repeat_one" : "repeat"}: ${repeatMode === "none"
                    ? "반복을 껐어요"
                    : "반복 유형을 " + (repeatMode == "song" ? "곡으로" : "전체로") + " 설정했어요"}`,
            }),
        ],
    });
});
