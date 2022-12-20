"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeChoice = exports.search = void 0;
const discord_js_1 = require("discord.js");
const ytdl_core_1 = require("ytdl-core");
const ytsr_1 = __importDefault(require("ytsr"));
async function search(keyword, limit = 5) {
    return new Promise(async (resolve, reject) => {
        const filters = await ytsr_1.default.getFilters(keyword);
        const typeFilters = filters.get("Type");
        if (!typeFilters)
            return reject(new Error("resultNotFound"));
        const filter = typeFilters.get("Video");
        if (!filter || !filter.url)
            return reject(new Error("resultNotFound"));
        let searchResult = (await (0, ytsr_1.default)(filter.url, { hl: "ko", gl: "KR", limit })).items;
        if (!searchResult || searchResult.length === 0)
            return reject(new Error("resultNotFound"));
        return resolve(searchResult.slice(0, limit));
    });
}
exports.search = search;
async function makeChoice(searchResult, interaction) {
    return new Promise(async (resolve, reject) => {
        try {
            let question = "**:scroll: 노래를 선택해 주세요.**";
            searchResult.map((item, index) => {
                if (item.type != "video")
                    return;
                question += `\n${index + 1}. ${item.title} (${item.duration})`;
            });
            await interaction.editReply(question);
            const message = await interaction.channel?.awaitMessages({
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
            });
            if (!message || !message.first())
                return reject(new Error("Timeout"));
            const choice = Number(message.first()?.content) - 1;
            if (isNaN(choice) || choice < 0 || choice > 4)
                return reject(new Error("invalidChoice"));
            const result = searchResult[choice];
            if (!result || result.type != "video")
                return reject(new Error("invalidResult"));
            await interaction.editReply("곡을 추가하는 중이에요.");
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
exports.makeChoice = makeChoice;
