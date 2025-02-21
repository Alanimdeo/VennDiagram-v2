import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Collection,
  GuildMember,
  InteractionEditReplyOptions,
} from "discord.js";
import { getInfo, videoInfo } from "@distube/ytdl-core";
import ytsr from "@distube/ytsr";

export async function search(
  keyword: string,
  limit: number = 5
): Promise<ytsr.Video[]> {
  return new Promise(async (resolve, reject) => {
    const result = await ytsr(keyword, {
      hl: "ko",
      gl: "KR",
      limit,
      type: "video",
    });
    if (!result || !result.results || result.items.length == 0)
      return reject(new Error("resultNotFound"));
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
      const choices = new ActionRowBuilder();
      searchResult.map((item, index) => {
        if (item.type != "video") return;
        question += `\n${index + 1}. [\`${item.name}\`](<${item.url}>) (${item.duration})`;
        choices.addComponents(
          new ButtonBuilder()
            .setCustomId(String(index))
            .setLabel(String(index + 1))
            .setStyle(ButtonStyle.Primary)
        );
      });
      const cancel = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("cancel")
          .setLabel("취소")
          .setStyle(ButtonStyle.Danger)
      );

      const reply = await interaction.editReply({
        content: question,
        // @ts-ignore
        components: [choices, cancel],
        withResponse: true,
      });

      const message = await Promise.any([
        interaction.channel?.awaitMessages({
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
        }),
        reply.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 30000,
        }),
      ]).catch(() => {
        reject(new Error("Timeout"));
      });
      if (!message) return reject(new Error("Timeout"));
      let choice: number;
      if (message instanceof Collection) {
        if (!message.first()) return reject(new Error("Timeout"));
        choice = Number(message.first()?.content) - 1;
      } else {
        if (message.customId === "cancel") {
          return reject(new Error("Cancel"));
        }
        choice = Number(message.customId);
      }
      if (isNaN(choice) || choice < 0 || choice > searchResult.length)
        return reject(new Error("invalidChoice"));
      const result = searchResult[choice];
      if (!result || result.type != "video")
        return reject(new Error("invalidResult"));
      await interaction.editReply({
        content: "곡을 추가하는 중이에요.",
        components: [],
      });
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
