"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("정지").setDescription("노래를 정지합니다. 정지해도 목록에서 사라지지 않습니다."), async (interaction, bot) => {
    await interaction.deferReply();
    let author = interaction.member;
    if (!author.voice.channel || !interaction.guildId)
        return await interaction.editReply("먼저 음성 채널에 참가하세요.");
    let guildQueue = bot.player.queue.get(interaction.guildId);
    if (!guildQueue || guildQueue.songs.length === 0 || !guildQueue.isPlaying)
        return await interaction.editReply("노래가 재생 중이지 않아요.");
    guildQueue.audioPlayer.stop();
    await interaction.editReply({
        embeds: [new discord_js_1.MessageEmbed().setColor("#008000").setTitle(":pause_button: 곡을 정지했어요")],
    });
});
