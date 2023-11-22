import { GuildMember } from "discord.js";
import { videoInfo } from "ytdl-core";
import { convertSecondsToTime } from "./time";

export class Song {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  isLive: boolean;
  startFrom: number;
  requestedUser: GuildMember;

  constructor(songInfo: videoInfo, startFrom: number = 0, requestedUser: GuildMember) {
    this.title = songInfo.videoDetails.title;
    this.url = songInfo.videoDetails.video_url;
    this.thumbnail = `https://i.ytimg.com/vi/${songInfo.videoDetails.videoId}/hqdefault.jpg`;
    let duration = Number(songInfo.videoDetails.lengthSeconds);
    this.duration = convertSecondsToTime(duration);
    this.isLive = songInfo.videoDetails.isLiveContent;
    this.startFrom = startFrom;
    this.requestedUser = requestedUser;
  }
}
