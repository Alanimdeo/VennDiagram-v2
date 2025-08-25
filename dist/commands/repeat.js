"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
exports.default = new types_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("반복")
    .setDescription("반복 유형을 설정합니다.")
    .addStringOption((option) => option
    .setName("유형")
    .setDescription("반복 유형을 선택하세요.")
    .addChoices({ name: "없음", value: "off" }, { name: "곡", value: "track" }, { name: "전체", value: "queue" })
    .setRequired(true)), async (interaction, bot) => {
    await interaction.deferReply();
    const author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    const player = bot.manager.players.get(interaction.guildId);
    if (!player)
        return await interaction.editReply("재생 목록에 노래가 없어요.");
    const repeatMode = interaction.options.getString("유형", true);
    if (!["off", "track", "queue"].includes(repeatMode)) {
        return await interaction.editReply("올바른 반복 유형을 선택하세요.");
    }
    player.setLoop(repeatMode);
    await interaction.editReply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor("#008000")
                .setTitle(`:${repeatMode === "off" ? "arrow_right" : repeatMode === "track" ? "repeat_one" : "repeat"}: ${repeatMode === "off"
                ? "반복을 껐어요"
                : "반복 유형을 " +
                    (repeatMode == "track" ? "곡으로" : "전체로") +
                    " 설정했어요"}`),
        ],
    });
});
