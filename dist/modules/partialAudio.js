"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartialAudio = exports.getVideoInfo = void 0;
const stream_1 = __importDefault(require("stream"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const getVideoInfo = async (videoUrl) => {
    const video = await ytdl_core_1.default.getInfo(videoUrl);
    const formats = video.formats.filter((format) => format.hasAudio === true && format.audioCodec === "opus");
    formats.sort((a, b) => {
        if (a.hasVideo && !b.hasVideo)
            return 1;
        if (!a.hasVideo && b.hasVideo)
            return -1;
        return 0;
    });
    return formats[0];
};
exports.getVideoInfo = getVideoInfo;
async function getPartialAudio(videoUrl, startFrom) {
    const videoInfo = await (0, exports.getVideoInfo)(videoUrl);
    const ff = (0, fluent_ffmpeg_1.default)(videoInfo.url).seek(startFrom).format("ogg");
    const ffStream = new stream_1.default.PassThrough();
    ff.pipe(ffStream, { end: true });
    return ffStream;
}
exports.getPartialAudio = getPartialAudio;
