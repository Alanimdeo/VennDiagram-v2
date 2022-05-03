"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("목록").setDescription("재생 목록을 확인합니다."), async (interaction, bot) => {
    await interaction.deferReply();
    let message = "";
    let guildQueue = bot.player.queue.get(interaction.guildId || "");
    if (guildQueue && guildQueue.songs.length !== 0) {
        let length = String(guildQueue.songs.length).length;
        guildQueue.songs.forEach((song, index) => {
            message += `\n${index === 0 ? (guildQueue?.isPlaying ? ":arrow_forward:" : ":pause_button:") : ""}\`${String(index + 1).padStart(length, "0")}. ${song.title} (${song.duration})\``;
        });
    }
    else
        message += ".노래가 없어요. `/재생 (노래 제목 또는 유튜브 링크)` 명령어를 통해 노래를 틀어 보세요!";
    const repeatMode = guildQueue
        ? " (반복 모드: " +
            (guildQueue.repeatMode === "none" ? "없음" : guildQueue.repeatMode === "song" ? "곡" : "전체") +
            ")"
        : "";
    await interaction.editReply({
        embeds: [
            new discord_js_1.MessageEmbed({
                color: "#0067a3",
                title: `:scroll: ${interaction.guild?.name}의 재생 목록${repeatMode}`,
                description: message.slice(1),
            }),
        ],
    });
});
