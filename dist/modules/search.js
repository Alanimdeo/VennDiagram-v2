"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
exports.makeChoice = makeChoice;
const discord_js_1 = require("discord.js");
const ytdl_core_1 = require("@distube/ytdl-core");
const ytsr_1 = __importDefault(require("@distube/ytsr"));
async function search(keyword, limit = 5) {
    return new Promise(async (resolve, reject) => {
        const result = await (0, ytsr_1.default)(keyword, {
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
async function makeChoice(searchResult, interaction) {
    return new Promise(async (resolve, reject) => {
        try {
            let question = "**:scroll: 노래를 선택해 주세요.**";
            const choices = new discord_js_1.ActionRowBuilder();
            searchResult.map((item, index) => {
                if (item.type != "video")
                    return;
                question += `\n${index + 1}. [\`${item.name}\`](<${item.url}>) (${item.duration})`;
                choices.addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(String(index))
                    .setLabel(String(index + 1))
                    .setStyle(discord_js_1.ButtonStyle.Primary));
            });
            const cancel = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("취소")
                .setStyle(discord_js_1.ButtonStyle.Danger));
            const reply = await interaction.editReply({
                content: question,
                // @ts-ignore
                components: [choices, cancel],
                withResponse: true,
            });
            const message = await Promise.any([
                interaction.channel?.awaitMessages({
                    filter: async (message) => {
                        if (message.author.id === interaction.member.id &&
                            message.channelId == interaction.channelId) {
                            await message.delete();
                            return true;
                        }
                        else {
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
            if (!message)
                return reject(new Error("Timeout"));
            let choice;
            if (message instanceof discord_js_1.Collection) {
                if (!message.first())
                    return reject(new Error("Timeout"));
                choice = Number(message.first()?.content) - 1;
            }
            else {
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
            const songInfo = await (0, ytdl_core_1.getInfo)(result.url);
            return resolve(songInfo);
        }
        catch (err) {
            if (err instanceof discord_js_1.Collection) {
                return reject(new Error("Timeout"));
            }
            return reject(err);
        }
    });
}
