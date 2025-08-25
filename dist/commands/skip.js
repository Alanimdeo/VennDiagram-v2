"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
exports.default = new types_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("다음")
    .setDescription("다음 곡을 재생합니다."), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    const player = bot.manager.players.get(interaction.guildId);
    if (!player || !player.current) {
        return await interaction.editReply("현재 재생 중인 노래가 없어요.");
    }
    if (player.queue.size > 0) {
        player.skip();
    }
    else {
        player.setLoop("off");
        player.stop();
    }
    await interaction.editReply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor("#008000")
                .setTitle(":fast_forward: 곡을 스킵했어요"),
        ],
    });
});
