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

export class Player {
  queue: Collection<string, Queue>;

  constructor() {
    this.queue = new Collection<string, Queue>();
  }
}

export class Queue {
  textChannel: TextBasedChannel;
  voiceChannel: VoiceBasedChannel;
  connection: VoiceConnection;
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

  constructor(textChannel: TextBasedChannel, voiceChannel: VoiceBasedChannel) {
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection = joinVoiceChannel({
      guildId: voiceChannel.guildId,
      channelId: voiceChannel.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
    });
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
      } else this.isPlaying = false;
    });
    this.audioPlayer.on(AudioPlayerStatus.Playing, async () => {
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
