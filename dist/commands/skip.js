"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
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
    guildQueue.songs.shift();
    guildQueue.play(guildQueue.songs[0]);
    await interaction.editReply({
        embeds: [
            new discord_js_1.MessageEmbed()
                .setTitle(":fast_forward: 다음 곡을 재생할게요")
                .setDescription(`[${guildQueue.songs[0].title}](${guildQueue.songs[0].url}) (${guildQueue.songs[0].duration > 59 ? Math.floor(guildQueue.songs[0].duration / 60) : "0"}:${guildQueue.songs[0].duration % 60})`)
                .setThumbnail(guildQueue.songs[0].thumbnail),
        ],
    });
});
