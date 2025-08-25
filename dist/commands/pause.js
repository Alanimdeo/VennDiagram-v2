"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
exports.default = new types_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("일시정지")
    .setDescription("음악을 일시정지합니다.")
    .addNumberOption((option) => option
    .setName("시간")
    .setDescription("일시정지할 시간을 입력하세요. 0.5초부터 입력할 수 있어요.")
    .setMinValue(0.5)
    .setRequired(false)), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel || !interaction.guildId)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    const player = bot.manager.players.get(interaction.guildId);
    if (!player) {
        return interaction.editReply("아무 것도 재생되고 있지 않아요.");
    }
    if (author.voice.channel.id !== player.voiceChannelId)
        return await interaction.editReply("봇과 같은 음성 채널에 참가하세요.");
    if (player.paused) {
        player.resume();
        return await interaction.editReply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setColor("#ffff00")
                    .setTitle(":arrow_forward: 일시정지를 해제했어요"),
            ],
        });
    }
    player.pause();
    let duration = interaction.options.getNumber("시간", false);
    await interaction.editReply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor("#ffff00")
                .setTitle(`:pause_button: 노래를 ${duration ? duration + "초 동안 " : ""}일시정지했어요`)
                .setDescription("`/일시정지` 명령어를 다시 입력하면 재생할 수 있어요."),
        ],
    });
    if (duration) {
        setTimeout(async () => {
            if (player.paused) {
                player.resume();
            }
        }, Number(duration) * 1000);
    }
});
