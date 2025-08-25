"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
const time_1 = require("../modules/time");
exports.default = new types_1.Command(new discord_js_1.SlashCommandBuilder()
    .setName("목록")
    .setDescription("재생 목록을 확인합니다."), async (interaction, bot) => {
    await interaction.deferReply();
    let message = "";
    const player = bot.manager.players.get(interaction.guildId);
    if (player && (player.playing || player.queue.size !== 0)) {
        message +=
            (player.paused ? ":pause_button:" : ":arrow_forward:") +
                `[\`${player.current.title}\`](<${player.current.url}>) (${(0, time_1.timeString)(player.current.duration / 1000)})`;
        let length = String(player.queue.size).length;
        player.queue.tracks.slice(0, 10).map((track, index) => {
            message += `\n\`${String(index + 1).padStart(length, "0")}\`. [\`${track.title}\`](<${track.url}>) (${(0, time_1.timeString)(track.duration / 1000)})`;
        });
        if (player.queue.size > 10) {
            message += `\n...외 ${player.queue.size - 10}곡`;
        }
    }
    else
        message +=
            "노래가 없어요. `/재생 (노래 제목 또는 유튜브 링크)` 명령어를 통해 노래를 틀어 보세요!";
    let title = `:scroll: ${interaction.guild?.name}의 재생 목록`;
    if (player && player.loop !== "off") {
        if (player.loop === "track") {
            title += " (:repeat_one: 1곡 반복 중)";
        }
        else {
            title += " (:repeat: 전체 반복 중)";
        }
    }
    await interaction.editReply({
        embeds: [
            new discord_js_1.EmbedBuilder()
                .setColor("#0067a3")
                .setTitle(title)
                .setDescription(message),
        ],
    });
});
