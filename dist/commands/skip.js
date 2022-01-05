"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("다음").setDescription("다음 곡을 재생합니다."), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel)
        return await interaction.editReply("음성 채널에 참가하세요!");
    let guildQueue = bot.player.queue.get(interaction.guildId ? interaction.guildId : "");
    if (!guildQueue || guildQueue.songs.length === 0)
        return await interaction.editReply("재생 목록에 노래가 없습니다!");
    await interaction.editReply("곡을 스킵했습니다.");
});
