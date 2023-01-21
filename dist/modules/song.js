"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Song = void 0;
class Song {
    constructor(songInfo, startFrom = 0, requestedUser) {
        this.title = songInfo.videoDetails.title;
        this.url = songInfo.videoDetails.video_url;
        this.thumbnail = `https://i.ytimg.com/vi/${songInfo.videoDetails.videoId}/hqdefault.jpg`;
        let duration = Number(songInfo.videoDetails.lengthSeconds);
        this.duration = `${duration > 59 ? Math.floor(duration / 60) : "0"}:${String(duration % 60).padStart(2, "0")}`;
        this.isLive = songInfo.videoDetails.isLiveContent;
        this.startFrom = startFrom;
        this.requestedUser = requestedUser;
    }
}
exports.Song = Song;
