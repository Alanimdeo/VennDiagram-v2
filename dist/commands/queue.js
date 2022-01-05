"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("목록").setDescription("재생 목록을 확인합니다."), async (interaction, bot) => {
    let message = `:scroll: ${interaction.guild?.name} 서버의 재생 목록`;
    let guildQueue = bot.player.queue.get(interaction.guildId ? interaction.guildId : "");
    if (guildQueue) {
        let length = String(guildQueue.songs.length).length;
        guildQueue.songs.forEach((song, index) => {
            message += `\n\`${String(index + 1).padStart(length, "0")}. ${song.title} (${song.duration})\``;
        });
    }
    else
        message += "이 없습니다.";
    await interaction.reply(message);
});
