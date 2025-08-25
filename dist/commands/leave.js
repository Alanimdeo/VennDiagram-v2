"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
exports.default = new types_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("퇴장")
    .setDescription("봇을 음성 채널에서 퇴장시킵니다."), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    let wrapper = bot.players.get(interaction.guildId);
    if (!wrapper)
        return await interaction.editReply("봇이 음성 채널에 참가 중이지 않아요.");
    if (author.voice.channel.id !== wrapper.player.voiceChannelId)
        return await interaction.editReply("봇과 같은 음성 채널에 참가하세요.");
    wrapper.player.stop({ destroy: true });
    bot.players.delete(interaction.guildId);
    await interaction.editReply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor("#008000")
                .setTitle(":eject: 음성 채널에서 퇴장했어요"),
        ],
    });
});
