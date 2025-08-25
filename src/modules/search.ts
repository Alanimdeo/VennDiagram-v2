import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Collection,
  GuildMember,
} from "discord.js";
import { Track } from "moonlink.js";
import { timeString } from "./time";

export async function makeChoice(
  searchResult: Track[],
  interaction: ChatInputCommandInteraction
): Promise<Track> {
  return new Promise(async (resolve, reject) => {
    try {
      let question = "**:scroll: 노래를 선택해 주세요.**";
      const choices = new ActionRowBuilder();
      searchResult.map((item, index) => {
        question += `\n${index + 1}. [\`${item.title}\`](<${item.url}>) (${timeString(item.duration / 1000)})`;
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

      const channel = interaction.channel;
      if (!channel || !channel.isSendable()) return;
      const message = await Promise.any([
        channel.awaitMessages({
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
      if (!result) return reject(new Error("invalidResult"));
      await interaction.editReply({
        content: "곡을 추가하는 중이에요.",
        components: [],
      });
      return resolve(result);
    } catch (err) {
      if (err instanceof Collection) {
        return reject(new Error("Timeout"));
      }
      return reject(err);
    }
  });
}
