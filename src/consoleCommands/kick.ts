import { SlashCommandBuilder } from "@discordjs/builders";
import { Bot, Command } from "../types";

module.exports = new Command(
  new SlashCommandBuilder().setName("kick").setDescription("연결 끊기"),
  async (message: string[], bot: Bot) => {
    try {
      if (message.length < 2) return "서버 ID와 멤버 ID를 입력해주세요.";
      const guild = await bot.guilds.fetch(message[0]);
      if (!guild) return "오류: 서버가 없거나 서버 정보를 불러올 권한이 부족합니다.";
      const member = guild.members.cache.get(message[1]);
      if (!member) return "서버에 존재하지 않는 멤버입니다.";
      await member.voice.disconnect();
      return `${member.nickname || member.user.username}(${member.id})의 음성 채널 연결을 끊었습니다.`;
    } catch (err) {
      return err;
    }
  }
);
