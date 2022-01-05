"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const types_1 = require("../types");
module.exports = new types_1.Command(new builders_1.SlashCommandBuilder().setName("목록").setDescription("재생 목록을 확인합니다."), async (interaction, bot) => {
    await interaction.reply("재생 목록:");
    bot.player.queue
        .get(interaction.guildId ? interaction.guildId : "")
        ?.songs.forEach(async (song) => await interaction.followUp("```" + JSON.stringify(song, undefined, 2) + "```"));
});
