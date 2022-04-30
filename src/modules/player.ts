import { Collection, MessageEmbed, TextBasedChannel, VoiceBasedChannel } from "discord.js";
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  demuxProbe,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
} from "@discordjs/voice";
import ytdl from "ytdl-core";
import { Song } from "./song";
import { Bot } from "../types";

export class Player {
  queue: Collection<string, Queue>;

  constructor() {
    this.queue = new Collection<string, Queue>();
  }
}

export class Queue {
  bot: Bot;
  textChannel: TextBasedChannel;
  voiceChannel: VoiceBasedChannel;
  connection: VoiceConnection;
  quitTimer: ReturnType<typeof setTimeout> | null;
  songs: Song[];
  isPlaying: boolean;
  repeatMode: "none" | "song" | "all";
  audioPlayer: AudioPlayer;
  async play(song: Song) {
    let probe = await demuxProbe(ytdl(song.url, { quality: "highestaudio", highWaterMark: 1 << 25 }));
    this.audioPlayer.play(createAudioResource(probe.stream, { inputType: probe.type }));
    this.connection.subscribe(this.audioPlayer);
    this.isPlaying = true;
  }

  constructor(textChannel: TextBasedChannel, voiceChannel: VoiceBasedChannel, bot: Bot) {
    this.bot = bot;
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection = joinVoiceChannel({
      guildId: voiceChannel.guildId,
      channelId: voiceChannel.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    });
    this.quitTimer = null;
    this.songs = [];
    this.isPlaying = false;
    this.repeatMode = "none";
    this.audioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
    this.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
      if (this.repeatMode === "none") this.songs.shift();
      else if (this.repeatMode === "all") {
        let shiftedSong = this.songs.shift();
        if (!shiftedSong) return;
        this.songs.push(shiftedSong);
      }
      if (this.songs.length > 0) {
        this.play(this.songs[0]);
      } else {
        this.isPlaying = false;
        this.quitTimer = setTimeout(() => {
          this.connection.destroy();
          this.bot.player.queue.delete(this.voiceChannel.guildId);
        }, 1_800_000);
      }
    });
    this.audioPlayer.on(AudioPlayerStatus.Playing, async () => {
      if (this.quitTimer) {
        clearTimeout(this.quitTimer);
        this.quitTimer = null;
      }
      if (this.repeatMode != "song")
        await this.textChannel.send({
          embeds: [
            new MessageEmbed()
              .setColor("#0067a3")
              .setTitle(":arrow_forward: 노래를 재생할게요")
              .setDescription(`[${this.songs[0].title}](${this.songs[0].url}) (${this.songs[0].duration})`)
              .setThumbnail(this.songs[0].thumbnail)
              .setFooter({
                text: `${this.songs[0].requestedUser.displayName} 님이 신청하셨어요.`,
                iconURL: this.songs[0].requestedUser.displayAvatarURL(),
              }),
          ],
        });
    });
  }
}
