"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("목록").setDescription("재생 목록을 확인합니다."), async (interaction, bot) => {
    let message = "";
    let guildQueue = bot.player.queue.get(interaction.guildId ? interaction.guildId : "");
    if (guildQueue) {
        let length = guildQueue.songs.length - 1;
        guildQueue.songs.forEach(async (song, index) => {
            message += `\n${index != length ? "├" : "⎿"} ${song.title} (${song.duration})`;
        });
    }
    await interaction.reply(`:scroll: ${interaction.guild?.name} 서버의 재생 목록${message}`);
});
