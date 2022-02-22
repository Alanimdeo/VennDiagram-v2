"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const ytsr_1 = __importDefault(require("ytsr"));
async function search(keyword, limit) {
    return new Promise(async (resolve, reject) => {
        const filters = await ytsr_1.default.getFilters(keyword);
        const typeFilters = filters.get("Type");
        if (!typeFilters)
            return reject(new Error("resultNotFound"));
        const filter = typeFilters.get("Video");
        if (!filter || !filter.url)
            return reject(new Error("resultNotFound"));
        const searchResult = await (0, ytsr_1.default)(filter.url, { hl: "ko", gl: "KR", limit: limit ? limit : 5 });
        return resolve(searchResult.items);
    });
}
exports.search = search;
