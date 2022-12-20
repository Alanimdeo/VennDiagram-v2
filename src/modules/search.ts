import { ChatInputCommandInteraction, Collection, GuildMember } from "discord.js";
import { getInfo, videoInfo } from "ytdl-core";
import ytsr from "ytsr";

export async function search(keyword: string, limit: number = 5): Promise<ytsr.Item[]> {
  return new Promise(async (resolve, reject) => {
    const filters = await ytsr.getFilters(keyword);
    const typeFilters = filters.get("Type");
    if (!typeFilters) return reject(new Error("resultNotFound"));
    const filter = typeFilters.get("Video");
    if (!filter || !filter.url) return reject(new Error("resultNotFound"));
    let searchResult = (await ytsr(filter.url, { hl: "ko", gl: "KR", limit })).items;
    if (!searchResult || searchResult.length === 0) return reject(new Error("resultNotFound"));
    return resolve(searchResult.slice(0, limit));
  });
}

export async function makeChoice(
  searchResult: ytsr.Item[],
  interaction: ChatInputCommandInteraction
): Promise<videoInfo> {
  return new Promise(async (resolve, reject) => {
    try {
      let question = "**:scroll: 노래를 선택해 주세요.**";
      searchResult.map((item, index) => {
        if (item.type != "video") return;
        question += `\n${index + 1}. ${item.title} (${item.duration})`;
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
      if (isNaN(choice) || choice < 0 || choice > 4) return reject(new Error("invalidChoice"));
      const result = searchResult[choice];
      if (!result || result.type != "video") return reject(new Error("invalidResult"));
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
