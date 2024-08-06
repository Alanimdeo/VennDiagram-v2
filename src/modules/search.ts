import {
  ChatInputCommandInteraction,
  Collection,
  GuildMember,
} from "discord.js";
import { getInfo, videoInfo } from "@distube/ytdl-core";
import ytsr from "@distube/ytsr";

export async function search(
  keyword: string,
  limit: number = 5
): Promise< ytsr.Video[]> {
  return new Promise(async (resolve, reject) => {
    const result = await ytsr(keyword, { hl: "ko", gl: "KR", limit, type: "video" });
    if (!result || !result.results || result.items.length == 0) return reject(new Error("resultNotFound"));
    return resolve(result.items.slice(0, limit));
  });
}

export async function makeChoice(
  searchResult: ytsr.Video[],
  interaction: ChatInputCommandInteraction
): Promise<videoInfo> {
  return new Promise(async (resolve, reject) => {
    try {
      let question = "**:scroll: 노래를 선택해 주세요.**";
      searchResult.map((item, index) => {
        if (item.type != "video") return;
        question += `\n${index + 1}. ${item.name} (${item.duration})`;
      });
      await interaction.editReply(question);
      const message = await interaction.channel?.awaitMessages({
        filter: async (message) => {
          if (
            message.author.id === (interaction.member as GuildMember).id &&
            message.channelId == interaction.channelId
          ) {
            await message.delete();
            return true;
          } else {
            return false;
          }
        },
        max: 1,
        time: 30000,
        errors: ["time"],
      });
      if (!message || !message.first()) return reject(new Error("Timeout"));
      const choice = Number(message.first()?.content) - 1;
      if (isNaN(choice) || choice < 0 || choice > 4)
        return reject(new Error("invalidChoice"));
      const result = searchResult[choice];
      if (!result || result.type != "video")
        return reject(new Error("invalidResult"));
      await interaction.editReply("곡을 추가하는 중이에요.");
      const songInfo = await getInfo(result.url);
      return resolve(songInfo);
    } catch (err) {
      if (err instanceof Collection) {
        return reject(new Error("Timeout"));
      }
      return reject(err);
    }
  });
}
