import { GuildMember } from "discord.js";
import { videoInfo } from "ytdl-core";

export class Song {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  isLive: boolean;
  requestedUser: GuildMember;

  constructor(songInfo: videoInfo, requestedUser: GuildMember) {
    this.title = songInfo.videoDetails.title;
    this.url = songInfo.videoDetails.video_url;
    this.thumbnail = `https://i.ytimg.com/vi/${songInfo.videoDetails.videoId}/hqdefault.jpg`;
    let duration = Number(songInfo.videoDetails.lengthSeconds);
    this.duration = `${duration > 59 ? Math.floor(duration / 60) : "0"}:${String(duration % 60).padStart(2, "0")}`;
    this.isLive = songInfo.videoDetails.isLiveContent;
    this.requestedUser = requestedUser;
  }
}
