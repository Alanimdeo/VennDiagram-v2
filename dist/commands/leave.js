"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("퇴장").setDescription("봇을 음성 채널에서 퇴장시킵니다."), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    if (!interaction.guildId)
        return;
    let guildQueue = bot.player.queue.get(interaction.guildId);
    if (!guildQueue)
        return await interaction.editReply("봇이 음성 채널에 참가 중이지 않아요.");
    guildQueue.audioPlayer.stop(true);
    guildQueue.connection.destroy();
    bot.player.queue.delete(interaction.guildId);
    await interaction.editReply({
        embeds: [new discord_js_1.MessageEmbed({ color: "#008000", title: ":eject: 음성 채널에서 퇴장했어요" })],
    });
});
