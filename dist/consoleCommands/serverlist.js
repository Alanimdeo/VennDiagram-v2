"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
module.exports = new types_1.Command(new discord_js_1.SlashCommandBuilder().setName("serverlist").setDescription("서버 목록"), async (message, bot) => {
    let guilds = bot.guilds.cache;
    let guildList = "서버 목록:\n";
    guilds.map((guild) => {
        guildList += `${guild.name}(${guild.id})\n`;
    });
    return guildList + `\n자세한 정보를 확인하려면, "serverinfo <서버ID>" 명령어를 사용하세요.`;
});
