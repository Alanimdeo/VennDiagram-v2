"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
module.exports = new types_1.Command(new discord_js_1.SlashCommandBuilder().setName("kick").setDescription("연결 끊기"), async (message, bot) => {
    try {
        if (message.length < 2)
            return "서버 ID와 멤버 ID를 정확히 입력해주세요.";
        const guild = await bot.guilds.fetch(message[0]);
        if (!guild)
            return "오류: 서버가 없거나 서버 정보를 불러올 권한이 부족합니다.";
        const member = guild.members.cache.get(message[1]);
        if (!member)
            return "서버에 존재하지 않는 멤버입니다.";
        await member.voice.disconnect();
        return `${member.nickname || member.user.username}(${member.id})의 음성 채널 연결을 끊었습니다.`;
    }
    catch (err) {
        return err;
    }
});
